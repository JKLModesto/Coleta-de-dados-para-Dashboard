const { google } = require('googleapis');
const fetch = require('node-fetch');
const credenciais = require('./credenciais.json');

const serviceAccountKeyFile = "./credenciais.json";
const sheetId = credenciais.idPlanilha;
const tabName = 'dados';

main().then(() => {
  console.log('Completed');
});

async function main() {
    // Geração do Cliente
    const googleSheetClient = await _getGoogleSheetClient();
  
    // Puxando a API de dados em json
    const apiData = await _fetchDataFromAPI('https://fakestoreapi.com/products');
  
    // Formatando os dados para ser inserido na planilha
    const formattedData = apiData.map(item => [
      item.id.toString(),
      item.title,
      item.price.toString(),
      item.description,
      item.category,
      item.image,
      item.rating.rate.toString(),
      item.rating.count.toString()
    ]);
  
    // Especificando as colunas da planilha
    const columnHeaders = [
      'id',
      'title',
      'price',
      'description',
      'category',
      'image',
      'rate',
      'count'
    ];
  
    // Inserindo as colunas na primeira linha e os dados logo em sequencia
    const request = {
      spreadsheetId: sheetId,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: [{
          range: `${tabName}!A1`,
          values: [columnHeaders],
        }, {
          range: `${tabName}!A2`,
          values: formattedData,
        }],
      },
    };
  
    // Adicionando os dados formatados no Google Sheet
    await googleSheetClient.spreadsheets.values.batchUpdate(request);
  }
  
// Função para a criação do cliente
async function _getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountKeyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({
    version: 'v4',
    auth: authClient,
  });
}

// Função para requisitar uma url e tratar os dados json
async function _fetchDataFromAPI(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}