export const BLOG_COPY = {
  en: {
    label: "The Elpino learning center", heading: "Ideas for better\ncustomer support.", intro: "Guides, product notes, and lessons from building AI that helps customers and knows when to bring in a person.", search: "What do you want to learn?", searchLabel: "Search Elpino articles", clear: "Clear search", topics: "Explore by topic", begin: "Choose where to begin", browse: "Browse the whole library or start with the part of Elpino you want to understand.", articles: "articles", viewAll: "View all {category} articles", featured: "Featured read", read: "Read article",
  },
  es: {
    label: "El centro de aprendizaje de Elpino", heading: "Ideas para una mejor\natención al cliente.", intro: "Guías, notas de producto y aprendizajes al crear IA que ayuda a los clientes y sabe cuándo acudir a una persona.", search: "¿Qué quieres aprender?", searchLabel: "Buscar artículos de Elpino", clear: "Borrar búsqueda", topics: "Explorar por tema", begin: "Elige por dónde empezar", browse: "Explora toda la biblioteca o empieza por la parte de Elpino que quieres entender.", articles: "artículos", viewAll: "Ver todos los artículos de {category}", featured: "Lectura destacada", read: "Leer artículo",
  },
  fr: {
    label: "Le centre d’apprentissage Elpino", heading: "Des idées pour un meilleur\nsupport client.", intro: "Guides, notes produit et retours d’expérience pour créer une IA qui aide les clients et sait quand faire appel à une personne.", search: "Que souhaitez-vous apprendre ?", searchLabel: "Rechercher des articles Elpino", clear: "Effacer la recherche", topics: "Explorer par sujet", begin: "Choisissez votre point de départ", browse: "Parcourez toute la bibliothèque ou commencez par la partie d’Elpino que vous souhaitez comprendre.", articles: "articles", viewAll: "Voir tous les articles {category}", featured: "À la une", read: "Lire l’article",
  },
  de: {
    label: "Das Elpino-Lernzentrum", heading: "Ideen für besseren\nKundensupport.", intro: "Leitfäden, Produktnotizen und Erfahrungen beim Aufbau von KI, die Kunden hilft und weiß, wann ein Mensch übernehmen sollte.", search: "Was möchten Sie lernen?", searchLabel: "Elpino-Artikel suchen", clear: "Suche löschen", topics: "Nach Thema entdecken", begin: "Wählen Sie Ihren Einstieg", browse: "Durchsuchen Sie die gesamte Bibliothek oder beginnen Sie mit dem Elpino-Bereich, den Sie verstehen möchten.", articles: "Artikel", viewAll: "Alle {category}-Artikel ansehen", featured: "Empfohlener Artikel", read: "Artikel lesen",
  },
  pt: {
    label: "O centro de aprendizagem Elpino", heading: "Ideias para um suporte\nao cliente melhor.", intro: "Guias, notas de produto e lições da criação de uma IA que ajuda clientes e sabe quando envolver uma pessoa.", search: "O que você quer aprender?", searchLabel: "Pesquisar artigos da Elpino", clear: "Limpar pesquisa", topics: "Explorar por tópico", begin: "Escolha por onde começar", browse: "Navegue pela biblioteca inteira ou comece pela área da Elpino que deseja entender.", articles: "artigos", viewAll: "Ver todos os artigos de {category}", featured: "Leitura em destaque", read: "Ler artigo",
  },
  ja: {
    label: "Elpino ラーニングセンター", heading: "よりよいカスタマーサポートの\nためのアイデア。", intro: "お客様を支援し、人への引き継ぎのタイミングを判断する AI を構築するためのガイド、製品ノート、知見です。", search: "何を学びたいですか？", searchLabel: "Elpino の記事を検索", clear: "検索をクリア", topics: "トピックから探す", begin: "始める場所を選ぶ", browse: "ライブラリ全体を見るか、理解したい Elpino の領域から始めましょう。", articles: "件の記事", viewAll: "{category} の記事をすべて見る", featured: "注目の記事", read: "記事を読む",
  },
} as const;

export function blogCopy(language: string) {
  return BLOG_COPY[language as keyof typeof BLOG_COPY] ?? BLOG_COPY.en;
}
