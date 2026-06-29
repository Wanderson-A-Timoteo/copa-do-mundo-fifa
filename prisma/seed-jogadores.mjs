import pg from "pg";
import "dotenv/config";
import { JOGADORES_POR_SELECAO, TECNICOS_POR_SELECAO } from "./dados-jogadores.ts";

const { Client } = pg;

const RENOMEAR_SELECOES = {
  "República da Coreia": "Coreia do Sul",
  Tchéquia: "República Tcheca",
  EUA: "Estados Unidos",
  Curaçau: "Curaçao",
  "RI do Irã": "Irã",
};

function toSlug(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  console.log("=== Seed de Jogadores (pg direto) ===");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // 1. Renomear seleções
    console.log("\n--- 1. Renomeando seleções ---");
    for (const [nomeAntigo, nomeNovo] of Object.entries(RENOMEAR_SELECOES)) {
      const { rows } = await client.query(
        `SELECT id FROM selecoes WHERE nome = $1`,
        [nomeAntigo]
      );
      if (rows.length > 0) {
        const slug = toSlug(nomeNovo);
        await client.query(
          `UPDATE selecoes SET nome = $1, slug = $2 WHERE id = $3`,
          [nomeNovo, slug, rows[0].id]
        );
        console.log(`  Renomeado: "${nomeAntigo}" -> "${nomeNovo}"`);
      } else {
        const { rows: existente } = await client.query(
          `SELECT id FROM selecoes WHERE nome = $1`,
          [nomeNovo]
        );
        if (existente.length > 0) {
          console.log(`  "${nomeNovo}" já existe, pulando.`);
        } else {
          console.log(`  "${nomeAntigo}" não encontrado.`);
        }
      }
    }

    // 2. Buscar seleções
    const { rows: todasSelecoes } = await client.query(
      `SELECT id, nome FROM selecoes ORDER BY id ASC`
    );

    // 3. Deletar figurinhas e jogadores existentes
    console.log("\n--- 2. Deletando dados existentes ---");
    const nomesParaSeed = Object.keys(JOGADORES_POR_SELECAO);

    for (const selecao of todasSelecoes) {
      const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
      if (nomesParaSeed.includes(nomeCorrigido)) {
        const { rows: qtdFig } = await client.query(
          `SELECT COUNT(*) as qtd FROM figurinhas WHERE "selecaoId" = $1`,
          [selecao.id]
        );
        const { rows: qtdJog } = await client.query(
          `SELECT COUNT(*) as qtd FROM jogadores WHERE "selecaoId" = $1`,
          [selecao.id]
        );
        const figCount = parseInt(qtdFig[0].qtd);
        const jogCount = parseInt(qtdJog[0].qtd);

        if (figCount > 0 || jogCount > 0) {
          console.log(`  ${nomeCorrigido}: deletando ${figCount} figurinhas e ${jogCount} jogadores...`);

          const { rows: figIds } = await client.query(
            `SELECT id FROM figurinhas WHERE "selecaoId" = $1`,
            [selecao.id]
          );
          const ids = figIds.map(r => r.id);
          if (ids.length > 0) {
            await client.query(
              `DELETE FROM album_figurinhas WHERE "figurinhaId" = ANY($1::int[])`,
              [ids]
            );
            await client.query(
              `DELETE FROM trocas WHERE "figurinhaOferecidaId" = ANY($1::int[])`,
              [ids]
            );
            await client.query(
              `DELETE FROM trocas WHERE "figurinhaDesejadaId" = ANY($1::int[])`,
              [ids]
            );
          }
          await client.query(`DELETE FROM figurinhas WHERE "selecaoId" = $1`, [selecao.id]);
          await client.query(`DELETE FROM jogadores WHERE "selecaoId" = $1`, [selecao.id]);
        }
      }
    }

    // 4. Inserir jogadores e figurinhas (batch por seleção)
    console.log("\n--- 3. Inserindo jogadores e figurinhas ---");
    let totalJogadores = 0;
    let totalFigurinhas = 0;

    const { rows: lastFig } = await client.query(
      `SELECT numero FROM figurinhas ORDER BY numero DESC LIMIT 1`
    );
    let numFigurinha = lastFig.length > 0 ? lastFig[0].numero + 1 : 1;

    for (const selecao of todasSelecoes) {
      const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
      const jogadores = JOGADORES_POR_SELECAO[nomeCorrigido];
      if (!jogadores) {
        console.log(`  Aviso: Nenhum jogador para "${nomeCorrigido}"`);
        continue;
      }

      const jogValues = [];
      const jogParams = [];
      let paramIdx = 1;
      for (const j of jogadores) {
        const camisa = Math.floor(Math.random() * 30) + 1;
        jogValues.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3})`);
        jogParams.push(selecao.id, j.nome, j.posicao, camisa);
        paramIdx += 4;
      }

      const { rows: criados } = await client.query(
        `INSERT INTO jogadores ("selecaoId", nome, posicao, "numeroCamisa") VALUES ${jogValues.join(", ")} RETURNING id`,
        jogParams
      );

      const figValues = [];
      const figParams = [];
      paramIdx = 1;
      for (const c of criados) {
        const raridade = Math.random() < 0.1 ? "rara" : "comum";
        figValues.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4})`);
        figParams.push(numFigurinha++, selecao.id, c.id, "jogador", raridade);
        paramIdx += 5;
      }

      await client.query(
        `INSERT INTO figurinhas (numero, "selecaoId", "jogadorId", tipo, raridade) VALUES ${figValues.join(", ")}`,
        figParams
      );

      totalJogadores += criados.length;
      totalFigurinhas += criados.length;
      console.log(`  ${nomeCorrigido}: ${criados.length} jogadores + figurinhas`);
    }

    // 5. Atualizar técnico
    console.log("\n--- 4. Atualizando técnicos ---");
    for (const selecao of todasSelecoes) {
      const nomeCorrigido = RENOMEAR_SELECOES[selecao.nome] ?? selecao.nome;
      const tecnico = TECNICOS_POR_SELECAO[nomeCorrigido];
      if (tecnico) {
        await client.query(
          `UPDATE selecoes SET tecnico = $1 WHERE id = $2`,
          [tecnico, selecao.id]
        );
        console.log(`  ${nomeCorrigido}: "${tecnico}"`);
      } else {
        console.log(`  Aviso: Nenhum técnico para "${nomeCorrigido}"`);
      }
    }

    console.log(`\nSeed concluído!`);
    console.log(`  Jogadores inseridos: ${totalJogadores}`);
    console.log(`  Figurinhas criadas: ${totalFigurinhas}`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
