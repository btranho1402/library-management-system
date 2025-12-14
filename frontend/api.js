const API_BASE = "https://qpsungdwq2.execute-api.us-east-1.amazonaws.com/prod";

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${json.message || text}`);
  }
  return json;
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${json.message || text}`);
  }
  return json;
}

async function addBookAPI(book) {
  return apiPost("/books/add", book);
}

