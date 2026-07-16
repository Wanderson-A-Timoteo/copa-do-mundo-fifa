export default function PoliticasPrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-20">
      <div className="rounded-3xl border border-zinc-200 bg-zinc-100 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-12">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Políticas de Privacidade
        </h1>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            A sua privacidade é fundamental para nós. O <strong>Bolão da Copa FIFA 2026</strong> se
            compromete a proteger os dados pessoais de nossos usuários, agindo em conformidade com a
            LGPD (Lei Geral de Proteção de Dados).
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Coleta de Dados
          </h2>
          <p>Coletamos as seguintes informações quando você cria uma conta:</p>
          <ul>
            <li>Nome de usuário ou nome do perfil do Google.</li>
            <li>Endereço de e-mail (usado apenas para login e recuperação de senha).</li>
            <li>Suas interações (palpites no bolão, progresso no álbum de figurinhas).</li>
          </ul>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Uso das Informações
          </h2>
          <p>
            As informações coletadas são utilizadas exclusivamente para o funcionamento do
            aplicativo: gerenciar suas pontuações no bolão, salvar o progresso do seu álbum e
            fornecer uma experiência personalizada. Não vendemos, alugamos ou compartilhamos seus
            dados com terceiros para fins de marketing.
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">Cookies</h2>
          <p>
            Utilizamos cookies técnicos essenciais apenas para manter sua sessão ativa (login) e
            lembrar de suas preferências de tema (Light/Dark). Não utilizamos cookies de
            rastreamento (tracking) ou anúncios de terceiros.
          </p>

          <h2 className="mt-8 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Exclusão de Conta
          </h2>
          <p>
            Você tem o direito de solicitar a exclusão da sua conta e de todos os dados associados a
            qualquer momento. Para isso, acesse as configurações do seu perfil e clique em "Excluir
            Conta". A remoção é imediata e irreversível.
          </p>

          <p className="mt-12 text-sm text-zinc-500">Última atualização: Julho de 2026</p>
        </div>
      </div>
    </main>
  );
}
