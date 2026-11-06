/**
 * Portal Parcerias Yuny — cadastro e login de corretores.
 * Cole este código em: planilha "Cadastros do Portal Parcerias (PRIVADA)" > Extensões > Apps Script.
 * Depois: Implantar > Nova implantação > App da Web
 *   - Executar como: Eu
 *   - Quem pode acessar: Qualquer pessoa
 * Copie a URL gerada e cole em API_URL no index.html.
 *
 * Colunas da aba "Cadastros" (linha 1 = cabeçalho):
 * A Data cadastro | B Nome | C CPF | D CRECI | E CRECI validado? | F Atua como | G Imobiliária
 * H CNPJ imobiliária | I WhatsApp | J E-mail | K Gerente escolhido | L Aceite do termo
 * M Último acesso | N Nº de acessos | O Senha (código, nunca a senha)
 *
 * Esqueceu a senha? Apague a célula da coluna O daquele corretor.
 * Ele faz o cadastro de novo com o mesmo CPF e a linha é atualizada.
 */

const ABA = "Cadastros";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents || "{}");
    if (d.acao === "cadastro") return json(cadastro(d));
    if (d.acao === "login") return json(login(d));
    if (d.acao === "acesso") return json(acesso(d));
    return json({ ok: false, erro: "acao" });
  } catch (err) {
    console.error(err);
    return json({ ok: false, erro: "interno" });
  } finally {
    lock.releaseLock();
  }
}

// Abrir a URL no navegador só confirma que está no ar.
function doGet() {
  return json({ ok: true, servico: "Portal Parcerias Yuny" });
}

function cadastro(d) {
  const cpf = soDig(d.cpf);
  if (cpf.length !== 11 || !/^[0-9a-f]{64}$/.test(d.senha || "") || String(d.nome || "").trim().split(/\s+/).length < 2) {
    return { ok: false, erro: "dados" };
  }
  const sh = aba();
  const linha = acharLinha(sh, cpf);
  if (linha && sh.getRange(linha, 15).getValue() !== "") return { ok: false, erro: "ja_existe" };

  const agora = new Date();
  const imob = d.atua === "imob";
  const valores = [[
    agora,
    texto(d.nome),
    fmt(cpf, /(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
    texto(d.creci),
    "A validar",
    imob ? "Imobiliária" : "Autônomo (PF)",
    imob ? texto(d.imob) : "",
    imob ? fmt(soDig(d.cnpj), /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : "",
    fmt(soDig(d.whats), /(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3"),
    texto(d.email),
    texto(d.gerenteNome || "Não tenho gerente"),
    d.aceite ? new Date(d.aceite) : agora,
    agora,
    1,
    selar(d.senha)
  ]];
  const destino = linha || sh.getLastRow() + 1;
  sh.getRange(destino, 3).setNumberFormat("@"); // CPF como texto
  sh.getRange(destino, 1, 1, 15).setValues(valores);
  return { ok: true };
}

function login(d) {
  const cpf = soDig(d.cpf);
  const sh = aba();
  const linha = acharLinha(sh, cpf);
  if (!linha) return { ok: false, erro: "nao_encontrado" };
  const row = sh.getRange(linha, 1, 1, 15).getValues()[0];
  if (row[14] === "") return { ok: false, erro: "nao_encontrado" }; // senha liberada para novo cadastro
  if (row[14] !== selar(d.senha || "")) return { ok: false, erro: "senha" };
  marcar(sh, linha, row[13]);
  return { ok: true, usuario: { cpf: cpf, nome: row[1], gerenteNome: row[10] } };
}

function acesso(d) {
  const sh = aba();
  const linha = acharLinha(sh, soDig(d.cpf));
  if (linha) marcar(sh, linha, sh.getRange(linha, 14).getValue());
  return { ok: true };
}

/* ---------- apoio ---------- */
function aba() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(ABA) || ss.insertSheet(ABA);
}
function acharLinha(sh, cpf) {
  const n = sh.getLastRow();
  if (n < 2 || cpf.length !== 11) return 0;
  const col = sh.getRange(2, 3, n - 1, 1).getDisplayValues();
  for (let i = 0; i < col.length; i++) if (soDig(col[i][0]) === cpf) return i + 2;
  return 0;
}
function marcar(sh, linha, n) {
  sh.getRange(linha, 13, 1, 2).setValues([[new Date(), (Number(n) || 0) + 1]]);
}
// Código secreto criado sozinho na primeira vez (fica em Configurações do projeto > Propriedades do script).
function segredo() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty("SEGREDO");
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty("SEGREDO", s); }
  return s;
}
function selar(h) {
  // hexadecimal (só 0-9 e a-f), para a planilha nunca confundir com fórmula
  return "h" + Utilities.computeHmacSha256Signature(String(h), segredo())
    .map(b => ((b + 256) % 256).toString(16).padStart(2, "0")).join("");
}
function soDig(v) { return String(v || "").replace(/\D/g, ""); }
function fmt(v, re, mask) { return v ? v.replace(re, mask) : ""; }
// Evita que um texto começando com = + - @ vire fórmula na planilha.
function texto(v) { const s = String(v || "").trim().slice(0, 200); return /^[=+\-@]/.test(s) ? "'" + s : s; }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Rode esta função uma vez pelo editor para autorizar o acesso à planilha.
function testar() {
  console.log(aba().getName(), "ok — linhas:", aba().getLastRow());
}
