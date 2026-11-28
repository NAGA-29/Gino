export type DocBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "code"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "note"; title: string; text: string };

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  sections: { title: string; blocks: DocBlock[] }[];
}

export const docPages: DocPage[] = [
  {
    slug: "overview",
    title: "はじめに・概要",
    description: "AI に渡す指示を登録し、変更を残しながら、用途ごとにまとめて使います。",
    sections: [
      {
        title: "このアプリでできること",
        blocks: [
          { type: "paragraph", text: "AI Instruction Registry は、AI に渡す指示を管理するアプリです。たとえば「API の設計を確認する手順」や「Motion Studio の開発ルール」を保存できます。保存した指示は Markdown（見出しや箇条書きを書けるテキスト形式）で書き出せます。" },
          { type: "table", headers: ["用語", "意味"], rows: [
            ["Instruction", "繰り返し使う指示のまとまりです。名前や説明、使う条件、ルールを持ちます。"],
            ["Version", "ある時点の指示の内容です。本文を変えて保存すると、新しい番号の Version として残ります。"],
            ["Activation Rule", "いつ使うか、いつ使わないかを記録する条件です。"],
            ["Project", "同じ作業や開発で使う Instruction をまとめる単位です。"],
            ["Scope / レイヤー", "指示を使う範囲です。Project では、Scope ごとに指示をまとめた「レイヤー」の順に並べます。"],
            ["Status / ライフサイクル", "下書きや公開済みなど、指示の状態です。"],
            ["Export", "保存した指示を、外で使える Markdown に書き出す機能です。"],
          ] },
          { type: "note", title: "指示を使うとき", text: "Activation Rule は、使いどころをメモしておくための情報です。条件に合わせて AI を自動で動かす機能ではありません。Export した内容を、利用先の AI に渡して使います。" },
        ],
      },
      {
        title: "最初の使い方",
        blocks: [
          { type: "list", ordered: true, items: [
            "New Instruction を開き、名前とルールを入力して Create を押します。",
            "詳細画面の Activation と Instructions で、保存した内容を確認します。",
            "一緒に使う指示が増えたら、Projects で Project を作り、Profile に追加します。",
            "Export で内容を確認し、Copy または Download で取り出します。",
          ] },
        ],
      },
      {
        title: "保存した指示を探す",
        blocks: [
          { type: "paragraph", text: "Instructions では Name で名前や説明を検索できます。Tag、Scope、Project、Status でも絞り込めます。一覧から名前を選ぶと詳細画面を開けます。" },
          { type: "paragraph", text: "Dashboard では、Scope 別・Status 別の件数や最近の変更を確認できます。" },
        ],
      },
    ],
  },
  {
    slug: "editing",
    title: "Instruction の作成と編集",
    description: "名前、使う条件、ルールを分けて入力します。",
    sections: [
      {
        title: "作成と保存の流れ",
        blocks: [
          { type: "paragraph", text: "New Instruction で各項目を入力し、Create を押します。最初の Version は 1.0.0、Status は draft、Scope は general が初期値です。保存後は詳細画面に移ります。変更するときは Edit を押します。" },
          { type: "note", title: "保存方法の違い", text: "General の項目だけを変えた場合は Save で上書きします。Activation、Instructions、Body、Tags を変えると Save as new version になり、新しい Version を作ります。名前や Status など General の変更は、Version ごとの履歴にはなりません。" },
        ],
      },
      {
        title: "General：名前と基本情報",
        blocks: [
          { type: "table", headers: ["項目", "入力する内容"], rows: [
            ["Display Name", "画面に表示する名前です。必須です。200文字以内で入力します。"],
            ["Name", "他と重ならない識別用の名前です。必須です。小文字の英字・数字をハイフンでつなぎます。100文字以内です。例：api-design-review。"],
            ["Description", "何をする指示かを短く書きます。省略できます。2000文字以内です。"],
            ["Scope", "general、organization、personal、project、experimental から、指示を使う範囲を選びます。詳しくは「プロジェクト」を参照してください。"],
            ["Status", "draft など、現在の状態を選びます。詳しくは「ステータス」を参照してください。"],
          ] },
          { type: "paragraph", text: "新規作成時は、Display Name の英数字から Name が自動入力されます。日本語だけの名前などで Name が空になる場合は、英数字で入力してください。Name は手動でも変えられます。" },
        ],
      },
      {
        title: "Activation：いつ使うか",
        blocks: [
          { type: "table", headers: ["項目", "入力する内容"], rows: [
            ["When", "使う場面を1行に1つ書きます。例：新しい API を設計する。"],
            ["When Not", "使わない場面を1行に1つ書きます。例：画面の見た目だけを変える。"],
            ["Required Context", "使う前に必要な情報や前提を書きます。例：backend。Enter で項目を追加します。"],
            ["Preferred Context", "あると役立つ情報や前提を書きます。例：typescript。Enter で項目を追加します。"],
          ] },
        ],
      },
      {
        title: "Instructions と Tags：指示の本文",
        blocks: [
          { type: "list", items: [
            "Rules：1行に1ルールを書きます。Export では箇条書きになります。",
            "Body (Markdown)：補足や例を書きます。省略できます。入力した Markdown がそのまま出力されます。",
            "Tags：探すときの目印です。Enter、カンマ、空白で項目を追加できます。保存時に小文字になります。",
          ] },
          { type: "code", text: "HTTP のステータスコードが適切か確認します。\nエラー時の返し方がそろっているか確認します。" },
          { type: "paragraph", text: "上の例は Rules に入力できます。保存時には、ルールや条件の空行、前後の空白、重複する項目が取り除かれます。" },
        ],
      },
      {
        title: "Version：保存する番号と説明",
        blocks: [
          { type: "paragraph", text: "Version には 1.0.0 のような番号を入力します。Change Summary には「エラー時の確認項目を追加」など、変更の要点を書きます。編集時は本文を変えると、この入力欄と番号の候補が表示されます。" },
        ],
      },
    ],
  },
  {
    slug: "versions",
    title: "バージョン管理と差分",
    description: "変更前の内容を残し、どこが変わったかを確認します。",
    sections: [
      {
        title: "新しい Version を作る",
        blocks: [
          { type: "list", ordered: true, items: [
            "Instruction の詳細画面で Edit を押し、本文を変更します。",
            "Version の候補を確認します。候補のボタンを押すか、番号を手動で入力します。",
            "Change Summary に変更の要点を書き、Save as new version を押します。",
          ] },
          { type: "paragraph", text: "新しく保存した Version が current（現在使う内容）になります。過去の Version は Versions に残ります。同じ Instruction で、すでに使った番号は使えません。" },
        ],
      },
      {
        title: "番号の候補の読み方",
        blocks: [
          { type: "paragraph", text: "SemVer は、1.2.3 のように3つの数字で変更の大きさを表す番号です。アプリは変更内容から、どの数字を増やすかを提案します。" },
          { type: "table", headers: ["種類", "候補になる変更", "1.2.3 からの例"], rows: [
            ["MAJOR", "Activation Rule の変更や、ルールの削除（ルールの数が減る変更）です。", "2.0.0"],
            ["MINOR", "ルールの追加（ルールの数が増える変更）や、タグの追加です。", "1.3.0"],
            ["PATCH", "ルールの数が変わらない文章の修正、Body の変更、タグの削除などです。", "1.2.4"],
          ] },
          { type: "note", title: "候補は目安です", text: "複数の変更がある場合は、MAJOR、MINOR、PATCH の順で大きい候補を表示します。候補どおりの番号にする必要はありません。保存するときに、番号の書き方が正しいか、すでに使われていないかを確認します。" },
        ],
      },
      {
        title: "2つの Version を比較する",
        blocks: [
          { type: "list", ordered: true, items: [
            "詳細画面で Versions を開きます。番号の大きい順に履歴が並びます。",
            "比較したい2つにチェックを入れ、Compare を押します。古い Version から新しい Version への変更点が表示されます。隣り合う履歴は diff からも比較できます。",
            "Diff 画面の From が変更前、To が変更後です。選び直すと、比較する組み合わせを変えられます。",
          ] },
          { type: "paragraph", text: "By section は Activation Diff、Instruction Diff、Body Diff、Tag Diff に分けた表示です。Unified はまとめた表示です。緑の + は追加、赤の - は削除を表します。" },
        ],
      },
    ],
  },
  {
    slug: "projects",
    title: "プロジェクト",
    description: "Project ごとに使う指示を選び、書き出す順番を整えます。",
    sections: [
      {
        title: "Project を作って指示を追加する",
        blocks: [
          { type: "list", ordered: true, items: [
            "Projects で New Project を押します。Name と、必要なら Description を入力し、Create を押します。",
            "Project の詳細画面で Profile を開きます。この指示のまとまりを Project Profile と呼びます。",
            "Instructionを追加 で保存済みの指示を選び、Add を押します。追加直後は Enabled がオン、Priority は 0 です。",
          ] },
          { type: "paragraph", text: "Instruction の詳細画面の Projects からも追加できます。Projectに追加 で Project を選び、Add を押します。" },
        ],
      },
      {
        title: "Scope とレイヤーの順番",
        blocks: [
          { type: "paragraph", text: "Scope は、その Instruction を使う範囲です。Project Profile は、追加した指示を次のレイヤー順に並べます。Scope を選ぶだけでは Project に自動追加されないため、使う指示を Add で選んでください。" },
          { type: "table", headers: ["順番・レイヤー", "Scope の値", "使い分けの目安"], rows: [
            ["1. General", "general", "幅広い作業で共通して使う指示です。"],
            ["2. Organization", "organization", "チームや組織で共通して使う指示です。"],
            ["3. Personal", "personal", "自分の好みや作業方針です。"],
            ["4. Project", "project", "特定の Project 向けの指示です。"],
            ["5. Experimental", "experimental", "試しながら使う指示です。"],
          ] },
        ],
      },
      {
        title: "Priority と Enabled",
        blocks: [
          { type: "list", items: [
            "Priority は同じレイヤー内の順番です。整数を入力し、入力欄から離れると保存されます。数字が大きい指示が先に並びます。",
            "Priority が同じ場合は Name のアルファベット順になります。Priority を大きくしても、別のレイヤーの指示より前には並びません。",
            "Enabled をオフにすると、Project には登録したまま、Project 単位の Export からだけ外せます。",
            "ごみ箱のボタンは Project との関連付けを外します。Instruction 本体は残ります。",
          ] },
          { type: "note", title: "並び順と AI の動作", text: "レイヤーと Priority は指示を並べるための設定です。ルール同士が食い違っていても、自動では調整されません。書き出した内容を確認してから使ってください。" },
          { type: "paragraph", text: "Project の Edit で名前と説明を変えられます。Delete で Project を削除しても、関連付けていた Instruction 本体は残ります。" },
        ],
      },
    ],
  },
  {
    slug: "export",
    title: "エクスポート",
    description: "1つの指示、選んだ複数の指示、Project 全体を Markdown に書き出します。",
    sections: [
      {
        title: "書き出す対象を選ぶ",
        blocks: [
          { type: "table", headers: ["対象", "操作"], rows: [
            ["1つの Instruction", "Instruction の詳細画面で Export を開きます。"],
            ["複数の Instruction", "サイドバーの Export を開き、Instructions に切り替えます。Instructions 欄で対象を選びます。1つだけ選ぶこともできます。"],
            ["Project 全体", "Project の詳細画面で Export を開きます。または、サイドバーの Export で Project を選びます。"],
          ] },
          { type: "paragraph", text: "Format は Generic Markdown です。対象を選ぶと、出力するテキストとファイル名が表示されます。Copy で全文をコピーでき、Download で .md ファイルを保存できます。" },
        ],
      },
      {
        title: "何が出力されるか",
        blocks: [
          { type: "list", items: [
            "現在の Version の内容と、現在の名前・説明・Scope・Status を出力します。",
            "Activation の条件、Rules の箇条書き、Body (Markdown)、Tags が含まれます。空の項目は省略されます。",
            "Project 単位では、Enabled がオンの指示をレイヤー順、同じレイヤー内では Priority の大きい順に出力します。",
            "複数選択では、Scope ごとに General → Organization → Personal → Project → Experimental の順でまとめます。同じ Scope 内は選んだ順です。",
          ] },
          { type: "note", title: "Status と出力対象", text: "Status だけでは出力から外れません。draft や archived も対象になります。Project で出したくない指示は Enabled をオフにしてください。複数選択では、出したい指示だけを選びます。" },
        ],
      },
      {
        title: "書き出した後の使い方",
        blocks: [
          { type: "paragraph", text: "プレビューを読み、使う条件やルールを確認します。Copy したテキストや Download したファイルを、利用先の AI に渡してください。書き出し後にアプリで指示を変えた場合は、もう一度 Export して取り直します。" },
        ],
      },
    ],
  },
  {
    slug: "lifecycle",
    title: "ステータス（ライフサイクル）",
    description: "Status で指示の準備状況や、使い続けるかどうかを示します。",
    sections: [
      {
        title: "5つの Status",
        blocks: [
          { type: "code", text: "draft → review → published → deprecated → archived" },
          { type: "table", headers: ["Status", "使い分けの目安"], rows: [
            ["draft", "下書きです。内容を書いたり、試したりしている段階に使います。"],
            ["review", "内容を確認したい段階に使います。"],
            ["published", "使う準備ができた指示に使います。"],
            ["deprecated", "今後は使わないようにしたい指示に使います。代わりの指示ができたときなどが目安です。"],
            ["archived", "使わなくなった指示を、履歴と一緒に残すときに使います。"],
          ] },
          { type: "paragraph", text: "この順番はあくまで目安です。順番どおりに進める必要はなく、どの Status にも自由に変更できます。" },
        ],
      },
      {
        title: "Status を変更する",
        blocks: [
          { type: "list", ordered: true, items: [
            "Instruction の詳細画面で、Edit の隣にある「…」のメニューを開きます。",
            "Status の下にある変更先を選びます。選ぶと保存されます。",
          ] },
          { type: "paragraph", text: "Edit の General にある Status を変え、Save で保存することもできます。Status だけを変えても新しい Version は作られません。Instructions 画面の Status 欄で、状態ごとに絞り込めます。" },
          { type: "note", title: "履歴を残す場合", text: "使わなくなった指示を残したい場合は archived を選びます。Delete を実行すると、Instruction の全 Version と Project への関連付けも削除されます。" },
          { type: "paragraph", text: "archived に変えても Export の対象から自動では外れません。Project からの出力を止めたい場合は、Profile の Enabled もオフにします。" },
        ],
      },
    ],
  },
];
