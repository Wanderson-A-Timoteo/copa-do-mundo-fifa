export default function TermosDeUsoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <div className="rounded-3xl border border-zinc-200 bg-zinc-100 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-12">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Termos de Uso
        </h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            Bem-vindo ao <strong>Bolão da Copa FIFA 2026</strong>. Ao utilizar nosso aplicativo,
            você concorda com os seguintes termos e condições. Recomendamos que os leia atentamente.
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            1. Uso do Aplicativo
          </h2>
          <p>
            O aplicativo é destinado ao entretenimento esportivo (futebol). É proibido utilizá-lo
            para apostas financeiras reais, atividades ilícitas ou qualquer fim que viole a
            legislação brasileira.
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            2. Contas de Usuário
          </h2>
          <p>
            Ao criar uma conta (via Google ou credenciais locais), você é responsável por manter a
            confidencialidade de sua senha e por todas as atividades que ocorrerem sob sua conta.
            Reservamo-nos o direito de encerrar contas que apresentem comportamento abusivo.
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            3. Propriedade Intelectual
          </h2>
          <p>
            Todos os direitos sobre a marca, design, logotipos e conteúdo original deste aplicativo
            pertencem aos seus desenvolvedores. Os nomes &quot;FIFA&quot;, &quot;Copa do Mundo&quot;
            e escudos de seleções são propriedades de suas respectivas entidades e são usados aqui
            em caráter meramente informativo e de entretenimento (fair use).
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            4. Modificações dos Termos
          </h2>
          <p>
            Podemos revisar estes termos a qualquer momento, sem aviso prévio. Ao continuar usando o
            aplicativo, você concorda em se submeter à versão mais recente destes Termos de Uso.
          </p>

          <p className="mt-12 text-sm text-zinc-500">Última atualização: Julho de 2026</p>
        </div>
      </div>
    </main>
  );
}
