// ===== エネミオン 共通モジュール（対戦・デッキセット・ひとりで で共用） =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getDatabase, ref, set, update, push, onValue,
  onDisconnect, remove, serverTimestamp, get
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6Y2XG4sWKHin4ZQjstzF0o9yUTVAQrFk",
  authDomain: "enemion.firebaseapp.com",
  databaseURL: "https://enemion-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "enemion",
  storageBucket: "enemion.firebasestorage.app",
  messagingSenderId: "1024531797284",
  appId: "1:1024531797284:web:b5be7ef927434ec46b8fb1",
  measurementId: "G-XC45Q1N2QP"
};

export function showFatalError(label, err){
  const banner = document.getElementById('fatal-error-banner');
  if(!banner) { console.error(label, err); return; }
  banner.classList.remove('hidden');
  banner.textContent = `[${label}] ${err && err.message ? err.message : err}`;
  console.error(label, err);
}
window.addEventListener('error', (e) => showFatalError('script error', e.error || e.message));
window.addEventListener('unhandledrejection', (e) => showFatalError('unhandled promise', e.reason));

export let app, db;
try{
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch(err){
  showFatalError('Firebase初期化失敗', err);
}
export { ref, set, update, push, onValue, onDisconnect, remove, serverTimestamp, get };

export const TYPE_LABEL = { atk:'攻撃🔴', spd:'速度🔵', def:'防御🟢', uni:'万能🟡', spc:'特化🟣' };
export const SPECIES_LIST = ['エネミー','異能者','無能力者'];

// エネミオン効果カタログ（atwiki 496番ページの情報を要約・再構成。演出テキストは省き数値・条件中心）
export const EFFECTS_CATALOG = [{"name":"対エネミー","pt":-1,"ex":false,"category":null,"text":"エネミーと対戦する際、相性が不利になる。"},{"name":"技量依存","pt":-1,"ex":false,"category":null,"text":"異能のメリット効果を使えない。次に出すと治る。"},{"name":"不攻撃","pt":-1,"ex":false,"category":null,"text":"次に出すとき1回、攻撃効果を使えない。"},{"name":"防御頼り","pt":-1,"ex":false,"category":null,"text":"相手から受ける数字の-値が2倍になる。"},{"name":"出遅れ","pt":-1,"ex":false,"category":null,"text":"後手のとき、自分の数字が0になり+値を受けない。"},{"name":"自力気質","pt":-1,"ex":false,"category":null,"text":"このカードの数字は効果で増えず、攻撃効果しか使えない。"},{"name":"命中難","pt":-1,"ex":false,"category":null,"text":"1d8を振り、1が出たらメリット効果を使えない。"},{"name":"火傷状態","pt":-1,"ex":false,"category":null,"text":"自分の数字を-1する（重複可）。4つ重なるごとにメリット効果を1つ使えなくなる。"},{"name":"不安定な状態","pt":-1,"ex":false,"category":null,"text":"1d3を振り、1が出たら数字が-1され増えなくなる（重複可）。"},{"name":"毒状態","pt":-1,"ex":false,"category":null,"text":"経過ターンごとに永続で数字が-1される（初期0、重複可）。毒の合計経過ターンが4以上でバトルに敗北。"},{"name":"感染状態","pt":-1,"ex":false,"category":null,"text":"デッキ内の感染状態1つにつき数字-1。次に出す自分のカードにも感染する（重複可）。"},{"name":"凍結状態","pt":-1,"ex":false,"category":null,"text":"数字が1以下だと出せない（重複で対象の数字が増える）。火傷状態になると治る。"},{"name":"短期決戦","pt":-2,"ex":false,"category":null,"text":"3ターン目終了時以降、メリット効果を使えない。"},{"name":"後先知らず","pt":-2,"ex":false,"category":null,"text":"次に出すとき1回、メリット効果を使えない。"},{"name":"限られた手段","pt":-2,"ex":false,"category":null,"text":"デッキ全体が試合中〈技能〉しか使えなくなる。"},{"name":"神経質","pt":-2,"ex":false,"category":null,"text":"状態異常があるときバトルに敗北する。"},{"name":"適応限界","pt":-2,"ex":false,"category":null,"text":"試合の場が変化しているときバトルに敗北する。"},{"name":"不運","pt":-2,"ex":false,"category":null,"text":"1d4を振り、1が出たらメリット効果を使えない。"},{"name":"強者の余裕","pt":-2,"ex":false,"category":null,"text":"勝ち点が相手より優勢のとき、メリット効果を使えない。"},{"name":"バッドコンディション","pt":-2,"ex":false,"category":null,"text":"メリット効果からランダムに1つ選び使用不可にする。"},{"name":"禁断","pt":-2,"ex":false,"category":null,"text":"3ターン目開始までメリット効果を使えない。"},{"name":"暴走","pt":-2,"ex":false,"category":null,"text":"デッキ内のランダムな他の1枚が、次に出すとき1回メリット効果を使えない。"},{"name":"麻痺状態","pt":-2,"ex":false,"category":null,"text":"常に相性不利扱いになる（元の相性は無視）。次に出すとき1回メリット効果を使えない（重複で回数加算）。"},{"name":"睡眠状態","pt":-2,"ex":false,"category":null,"text":"数字が0になり+値を受けない。次に出すとき1回メリット効果不可、その後全状態異常が治る。"},{"name":"出血状態","pt":-2,"ex":false,"category":null,"text":"数字-1、攻撃効果を1つ使えない（重複可）。メリット効果を全て放棄する代わりに治せる。"},{"name":"通常攻撃","pt":1,"ex":false,"category":"skill","text":"相手の数字を-2する。"},{"name":"強襲","pt":1,"ex":false,"category":"skill","text":"相手の数字を永続で-2する。次に出すとき1回この効果は使えない。"},{"name":"コンビネーションアタック","pt":1,"ex":false,"category":"skill","text":"デッキ内で最も多い同名効果の個数分、相手の数字を-1する。"},{"name":"重打撃","pt":1,"ex":false,"category":"skill","text":"バトル相手は次出すとき1回、メリット効果を使えない。"},{"name":"猫騙し","pt":1,"ex":false,"category":"skill","text":"先手なら、相手の〈異能〉以外のメリット効果を1つ選び発動させない。"},{"name":"迎撃","pt":1,"ex":false,"category":"skill","text":"後手なら、相手の攻撃効果と常時効果をそれぞれ1つ選び打ち消す。"},{"name":"狙撃","pt":1,"ex":false,"category":"skill","text":"相手デッキのメリット効果を1つ選び、次出すとき1回発動できなくする。"},{"name":"防御姿勢","pt":1,"ex":false,"category":"skill","text":"先手からの状態異常と〈技能〉を全て防ぐ。"},{"name":"パリィ","pt":1,"ex":false,"category":"skill","text":"先後を問わず、相手からの〈技能〉を防ぎ跳ね返す。"},{"name":"固装","pt":1,"ex":false,"category":"skill","text":"相手の狙撃効果を無視し、先手からの状態異常を防ぐ。"},{"name":"簡易結界","pt":1,"ex":false,"category":"skill","text":"〈異能〉の選択を無視し、先手からの〈異能〉を防ぐ。"},{"name":"軽業","pt":1,"ex":false,"category":"skill","text":"先後を問わず、相手からの〈異能〉以外を全て避ける。"},{"name":"ローリングステップ","pt":1,"ex":false,"category":"skill","text":"1d2を振り、2なら相手の効果を1つまで避ける。"},{"name":"異産","pt":1,"ex":false,"category":"skill","text":"無能力者でも〈異能〉を持てるようになる。"},{"name":"機体","pt":1,"ex":false,"category":"skill","text":"このカードは「機械」として扱われ、無能力者でも〈異能〉を持てる。"},{"name":"不屈","pt":1,"ex":false,"category":"skill","text":"効果では負けず、逆に勝つ。"},{"name":"必中","pt":1,"ex":false,"category":"skill","text":"このカードの攻撃は相手の回避を貫通して必中する。"},{"name":"貫通","pt":1,"ex":false,"category":"skill","text":"相手の常時効果と、〈異能〉以外の防御を貫通する。"},{"name":"瞬速","pt":1,"ex":false,"category":"skill","text":"試合1ターン目なら、数字を+3する。"},{"name":"根性","pt":1,"ex":false,"category":"skill","text":"状態異常のとき、数字を+3する。"},{"name":"下剋上","pt":1,"ex":false,"category":"skill","text":"相手の元の数字が自分より大きい場合、数字を+3する。"},{"name":"勇気","pt":1,"ex":false,"category":"skill","text":"自分の勝ち点が劣勢のとき、数字を+3する。"},{"name":"牽制","pt":1,"ex":false,"category":"skill","text":"次に出すとき、数字を+3する。"},{"name":"先手必勝","pt":1,"ex":false,"category":"skill","text":"先手なら、数字を+2する。"},{"name":"仲間に託す","pt":1,"ex":false,"category":"skill","text":"デッキの異能者か無能力者1枚を選び、永続で数字+2する。"},{"name":"光波撃","pt":1,"ex":false,"category":"ability","text":"相手の数字-1（相手の数字が元より増えていれば、さらに-3）。"},{"name":"波動弾","pt":1,"ex":false,"category":"ability","text":"相手の数字-2、または相手デッキ1枚を永続で-1する。"},{"name":"水切り","pt":1,"ex":false,"category":"ability","text":"相手の数字-2する。場が水浸しならさらに永続で-1する。"},{"name":"取り込む","pt":1,"ex":false,"category":"ability","text":"バトルに勝った時、相手の使用効果か、相手の+値と同じ分の永続+を得る。"},{"name":"耐久加護","pt":1,"ex":false,"category":"ability","text":"バトルに勝った時、相手は次出すとき勝っても勝ち点が増えない。"},{"name":"火炎","pt":1,"ex":false,"category":"ability","text":"相手を火傷状態にし、その後お互い1枚ずつ選び火傷状態にする。"},{"name":"氷点","pt":1,"ex":false,"category":"ability","text":"相手と次に出る相手を凍結状態にする。"},{"name":"電光石火","pt":1,"ex":false,"category":"ability","text":"お互いを麻痺状態にする。"},{"name":"毒の攻撃","pt":1,"ex":false,"category":"ability","text":"相手と相手デッキの1枚を毒状態にする。"},{"name":"妖しい光","pt":1,"ex":false,"category":"ability","text":"相手デッキの1枚を不安定な状態にする。"},{"name":"音波","pt":1,"ex":false,"category":"ability","text":"相手の数字を4にする（他の音波効果の数だけ下がる）。その後味方1枚に音波を付与。"},{"name":"氷柱落とし","pt":1,"ex":false,"category":"ability","text":"相手か相手デッキの凍結状態の1枚を選び、次のターン終了まで数字を1にする。"},{"name":"エネルギーシールド","pt":1,"ex":false,"category":"ability","text":"先手からの〈異能〉の攻撃を全て防ぐ。"},{"name":"音響壁","pt":1,"ex":false,"category":"ability","text":"自分と次の自分は、バトル相手の数字が1以下なら先手からの状態異常を全て防ぐ。"},{"name":"種","pt":1,"ex":false,"category":"ability","text":"大自然のとき、ターン終了時に「芽」になる。"},{"name":"潜水","pt":1,"ex":false,"category":"ability","text":"水浸しのとき、潜水を持たない相手の効果対象にならず、後手発動の効果を1つ回避する。"},{"name":"シャドウゲンガー","pt":1,"ex":false,"category":"ability","text":"夜空のとき、相手の狙撃効果の対象にならず、次のターンに睡眠状態が治る。"},{"name":"翼","pt":1,"ex":false,"category":"ability","text":"「飛行」として扱われる。デッキの1枚を選び風を付与する。"},{"name":"霊魂","pt":1,"ex":false,"category":"ability","text":"ロストから霊魂を1体呼び出す（バトル後デッキに戻る、合算せず効果のみ発動）。このカードはバトルに負けるとロストする。"},{"name":"野生","pt":1,"ex":false,"category":"ability","text":"場が大自然かつエネミーなら、必要EEが2になる。"},{"name":"身体強化","pt":1,"ex":false,"category":"ability","text":"自分の数字を永続で+1する。"},{"name":"菌","pt":1,"ex":false,"category":"ability","text":"相手に菌を付与する（重複可）。"},{"name":"水浸し","pt":1,"ex":false,"category":"ability","text":"場を水浸しにする。以後お互いは火傷状態にならず、数字が1以下でもそこから増えなくなる。"},{"name":"ゼログラビティ","pt":1,"ex":false,"category":"ability","text":"お互いの数字を0にし、重力を解除する。"},{"name":"賽は投げられた","pt":1,"ex":false,"category":"ability","text":"1d4を4回振り、順に自分の1〜4番のカードの必要EEと数字にする。"},{"name":"コピー能力","pt":1,"ex":true,"category":"ability","text":"EX効果。デッキの〈異能〉から1つ選び、次に出すときその効果になる。"},{"name":"終焉の時","pt":1,"ex":false,"category":"ability","text":"出てから7ターンで試合勝利のカウントダウンを開始。出るたび1ターン短縮する。"},{"name":"蠱毒","pt":1,"ex":false,"category":"ability","text":"全ての毒状態の経過ターンを2ターン戻す。劣勢かつ累計10ターン以上なら相手の勝ち点を-1する。"},{"name":"逆転の一手","pt":1,"ex":true,"category":"ability","text":"EX効果。数字か効果で負けて試合敗北する場面のとき1d4を振り、1が出れば逆転して勝利する。"},{"name":"不死","pt":1,"ex":true,"category":"ability","text":"EX効果。試合中1度だけ、負けても相手に勝ち点を渡さず、デメリットと-値を全て回復し、その分永続で数字+1する。"},{"name":"クエイクヒット","pt":2,"ex":false,"category":"skill","text":"相手の数字を永続で-2する。"},{"name":"連続攻撃","pt":2,"ex":false,"category":"skill","text":"相手の数字-1を3回行う。"},{"name":"拘束","pt":2,"ex":false,"category":"skill","text":"相手と次に出る相手にメリット効果を1つ選ばせ、発動させない。"},{"name":"制圧","pt":2,"ex":true,"category":"skill","text":"EX効果。バトルに勝った時、次に出る相手カードはメリット効果を使えない。"},{"name":"脅威","pt":2,"ex":false,"category":"skill","text":"バトルに勝った時、次のターンこのカードの必要EEが2になる。"},{"name":"諸刃の剣","pt":2,"ex":false,"category":"skill","text":"勝てば勝ち点2を獲得。負ければ次に出す自分のカードはメリット効果を使えない。"},{"name":"エネミー狩り","pt":2,"ex":false,"category":"skill","text":"エネミーに対して相性を無視して有利になる。相手の数字-2（相手がエネミーならさらに-2し、効果を1つ打ち消す）。"},{"name":"操弾","pt":2,"ex":false,"category":"skill","text":"狙撃効果が発動したとき、追加でもう1枚選べる。"},{"name":"健康体","pt":2,"ex":false,"category":"skill","text":"状態異常にならない。"},{"name":"異体術","pt":2,"ex":false,"category":"skill","text":"相性と数字を無視して先後を選べる。"},{"name":"盾","pt":2,"ex":false,"category":"skill","text":"自分と次の自分は先手からの攻撃を防ぐ。"},{"name":"回避","pt":2,"ex":false,"category":"skill","text":"先手なら相手の効果を1つまで避ける。"},{"name":"突撃号令！！","pt":2,"ex":false,"category":"skill","text":"数字+4する。次出すとき1回この効果は不発になる。"},{"name":"戦闘配備","pt":2,"ex":false,"category":"skill","text":"自分か味方の異能者・無能力者1枚ずつを選び、永続で数字+1する。"},{"name":"治療","pt":2,"ex":false,"category":"skill","text":"自分か味方全員のどちらかを選び、試合中についた新しいデメリットを全て治す。"},{"name":"2回行動","pt":2,"ex":true,"category":"skill","text":"EX効果。1回出た後、もう一度出直せる（デメリットも発動、元の数字は重複しない）。"},{"name":"戦場","pt":2,"ex":false,"category":"skill","text":"場を戦場にする。以後お互いは数字が+値されず、効果では勝てなくなる。"},{"name":"エナジースラッシュ","pt":2,"ex":false,"category":"ability","text":"相手の数字-4する。"},{"name":"エナジーショット","pt":2,"ex":false,"category":"ability","text":"相手の数字を永続で-1、または相手デッキ1枚を永続で-3する。"},{"name":"無力封じ","pt":2,"ex":false,"category":"ability","text":"相手の〈異能〉以外のメリット効果を全て打ち消す。"},{"name":"無効化","pt":2,"ex":true,"category":"ability","text":"EX効果。相手の〈異能〉を全て打ち消す。"},{"name":"幻惑","pt":2,"ex":false,"category":"ability","text":"バトルに勝った時、次のターン相手はカードを選べず1d4でランダム決定される（EE不足なら繰り下げ）。"},{"name":"オーバーヒート","pt":2,"ex":false,"category":"ability","text":"お互いを4回、火傷状態にする。"},{"name":"雷撃","pt":2,"ex":false,"category":"ability","text":"相手と相手デッキ1枚を麻痺状態にする。"},{"name":"斬撃","pt":2,"ex":false,"category":"ability","text":"相手を出血状態にする。"},{"name":"病原","pt":2,"ex":false,"category":"ability","text":"相手を感染状態にする。"},{"name":"欠伸","pt":2,"ex":false,"category":"ability","text":"お互いを睡眠状態にする。"},{"name":"弱体化攻撃","pt":2,"ex":false,"category":"ability","text":"相手か相手のカードを不安定な状態にする。"},{"name":"アシッドポイズン","pt":2,"ex":false,"category":"ability","text":"お互いのデッキから1枚ずつ選び毒状態にする。既存の毒状態を1ターン分経過させる。"},{"name":"フリーズチェーン","pt":2,"ex":false,"category":"ability","text":"凍結状態の相手全員にメリット効果を1つ選ばせて打ち消し、次のターン終了まで凍結状態を延長する。"},{"name":"増強","pt":2,"ex":false,"category":"ability","text":"数字+2する。"},{"name":"エネルギーチャージ","pt":2,"ex":false,"category":"ability","text":"数字を永続で+1する。以後出るたび+値が1ずつ増える。"},{"name":"異能の呼応","pt":2,"ex":false,"category":"ability","text":"自分以外の味方の異能者を全て永続で+1する。"},{"name":"芽","pt":2,"ex":false,"category":"ability","text":"ターン開始時、数字を永続で+1する（大自然ならターン終了時「花」になる）。"},{"name":"風","pt":2,"ex":false,"category":"ability","text":"以後、風が使われるたび風を持つカードが+1される（最大+4）。"},{"name":"変身","pt":2,"ex":false,"category":"ability","text":"自分の数字が4になる。"},{"name":"バリア","pt":2,"ex":false,"category":"ability","text":"先手からの効果を全て防ぐ。"},{"name":"飛行","pt":2,"ex":false,"category":"ability","text":"「飛行」を持たない相手の効果を1つ回避する。"},{"name":"音速","pt":2,"ex":false,"category":"ability","text":"バトル相手の数字が1以下なら、相手の効果を回避する。"},{"name":"自己再生","pt":2,"ex":false,"category":"ability","text":"試合中についたデメリットと-値を全て治す。"},{"name":"毒薬","pt":2,"ex":false,"category":"ability","text":"毒状態を1ターン経過させ、その累計分だけ自分とデッキ内の状態異常を治す。"},{"name":"地形操作","pt":2,"ex":false,"category":"ability","text":"場を通常に戻す（次のターン終了まで場が変化しない）。すでに通常なら相手の数字-2する。"},{"name":"黄泉送り","pt":2,"ex":false,"category":"ability","text":"デッキの1枚を選び、次の1ターンの間ロストさせる。"},{"name":"開運","pt":2,"ex":false,"category":"ability","text":"試合中のダイス処理を、任意で振り直しさせられる。"},{"name":"EEブースト","pt":2,"ex":true,"category":"ability","text":"EX効果。次のターン、自分のEEが+1される。"},{"name":"発電","pt":2,"ex":false,"category":"ability","text":"自分を麻痺状態にし、EEを+1する。"},{"name":"エネルギー燃焼","pt":2,"ex":false,"category":"ability","text":"自分のカード1枚を4回火傷状態にし、EEを+1する。"},{"name":"血の代償","pt":2,"ex":false,"category":"ability","text":"自分を出血状態にし、EEを+1する（すでに出血状態なら使用不可）。"},{"name":"エネミー化","pt":2,"ex":true,"category":"ability","text":"EX効果。自分か相手のカード1枚を選び、次出すとき〈異能〉を2回発動する（エネミーでなければ暴走とエネミー化も付与）。"},{"name":"洗礼された一撃","pt":3,"ex":false,"category":"skill","text":"相手の数字を永続で-3する。"},{"name":"ラッシュ","pt":3,"ex":false,"category":"skill","text":"相手の数字-1を4回行う。次出すときさらにもう1回追加で行う。"},{"name":"殲滅作戦","pt":3,"ex":false,"category":"skill","text":"バトル相手と次の相手の数字-1、それぞれ次出すとき1回〈異能〉以外のメリット効果を使えなくする。"},{"name":"異能殺し","pt":3,"ex":false,"category":"skill","text":"デッキのメリット効果が〈技能〉のみなら、相手の〈異能〉を1つ選び打ち消す。"},{"name":"エネミー特攻","pt":3,"ex":false,"category":"skill","text":"相手がエネミーなら、このバトルに勝つ。"},{"name":"暗殺","pt":3,"ex":true,"category":"skill","text":"EX効果。相手のカード1枚を選ぶ。それは次出すとき1回バトルに敗北する。"},{"name":"硬壁","pt":3,"ex":false,"category":"skill","text":"自分と次の自分は先手からの攻撃を全て防ぐ。防御成功時、数字+1する。"},{"name":"技巧派","pt":3,"ex":false,"category":"skill","text":"相性を無視して有利になる。"},{"name":"機械","pt":3,"ex":false,"category":"skill","text":"「機械」を除く相手からの攻撃・状態異常で数字が減らない。"},{"name":"ビートブレード","pt":3,"ex":false,"category":"skill","text":"「機械」として扱われる。相手を3回火傷状態にする。"},{"name":"カリスマ","pt":3,"ex":false,"category":"skill","text":"自分とデッキ内の同種族の数字を全て永続で+1する。"},{"name":"火事場の馬鹿力","pt":3,"ex":false,"category":"skill","text":"数字が2倍になるよう+する。"},{"name":"異界陣","pt":3,"ex":false,"category":"skill","text":"場を異界陣にする。相手が先手ならその数字-1、自分が先手ならその数字+1する。"},{"name":"異産:名称","pt":3,"ex":false,"category":"skill","text":"名称と効果を先に決め、EXを除く合計3ptの〈異能〉と〈技能〉を1種ずつ組み合わせて1つの技能効果として扱う。次出すとき1回不発。"},{"name":"破壊の光線","pt":3,"ex":false,"category":"ability","text":"相手の数字-6する。"},{"name":"聖なる浄化","pt":3,"ex":false,"category":"ability","text":"自分と味方の新しくついた状態異常・付与効果を全て治し、治した数だけ相手の数字-1する。"},{"name":"爆発","pt":3,"ex":false,"category":"ability","text":"相手デッキ全てを1回ずつ火傷状態にし、その後お互い3枚ずつ選び火傷状態にする。"},{"name":"ブリザード","pt":3,"ex":false,"category":"ability","text":"バトル相手を凍結状態にする。次のターンは2回、その次は3回に増える。"},{"name":"落雷","pt":3,"ex":false,"category":"ability","text":"次のターン終了まで麻痺状態が必中で-1する効果を持つ。相手か相手デッキ1枚を麻痺状態にする。"},{"name":"真空斬","pt":3,"ex":false,"category":"ability","text":"相手を出血状態にする（すでに出血状態ならそのカードはロストする）。"},{"name":"パラサイトアウト","pt":3,"ex":false,"category":"ability","text":"次のターン終了まで感染状態が貫通・治らない効果を持つ。相手デッキ1枚を感染状態にする。"},{"name":"催眠術","pt":3,"ex":false,"category":"ability","text":"相手を睡眠状態にする。"},{"name":"精神への攻撃","pt":3,"ex":false,"category":"ability","text":"相手を命中難・不運・不安定な状態にする。"},{"name":"大海原","pt":3,"ex":false,"category":"ability","text":"場を水浸しにし相手の数字-2する（すでに水浸しなら自分と味方1枚に潜水を付与）。"},{"name":"大強化","pt":3,"ex":false,"category":"ability","text":"数字+3する。"},{"name":"成長","pt":3,"ex":false,"category":"ability","text":"ターン開始時、経過ターン数だけ永続で数字+1する（最大+4）。"},{"name":"花","pt":3,"ex":false,"category":"ability","text":"数字+2し、味方に種を付与する（大自然ならもう一度発動）。"},{"name":"相伝継承","pt":3,"ex":true,"category":"ability","text":"EX効果。相伝継承を持たない味方の異能者・無能力者1枚を選び、継承側と同じ数字だけ永続+1し、相伝継承か他のメリット効果を付与する。"},{"name":"変異ウイルス","pt":3,"ex":false,"category":"ability","text":"次のターン終了まで、自分につく菌は数字+1、相手につく菌は数字-1になる（重複しない）。"},{"name":"大氷壁","pt":3,"ex":false,"category":"ability","text":"自分と次の自分は先手からの攻撃を全て防ぎ、攻撃した相手を凍結状態にする。"},{"name":"暴風壁","pt":3,"ex":false,"category":"ability","text":"「風」として扱われる。自分と次の自分は先手からの攻撃を防ぎ、成功時味方1枚に風を付与する。"},{"name":"避雷針","pt":3,"ex":false,"category":"ability","text":"味方が状態異常になるたび1つまで引き受けて無効化し、その後相手を麻痺状態にする。出た時、引き受けた回数分相手の数字-1する。"},{"name":"飛空斬り","pt":3,"ex":false,"category":"ability","text":"「飛行」として扱われる。相手か相手デッキ1枚を出血状態にする。"},{"name":"夜空","pt":3,"ex":false,"category":"ability","text":"場を夜空にする。以後お互いは睡眠状態になる。"},{"name":"天空城","pt":3,"ex":false,"category":"ability","text":"「飛行」として扱われる。場を天空城にする。以後、飛行を持たないカードは数字-1される。"},{"name":"重力","pt":3,"ex":false,"category":"ability","text":"場を重力にする。以後、効果テキスト中の数字を1減らして扱う（重複可、漢数字は除く）。"},{"name":"ハンマースレッジ","pt":4,"ex":false,"category":"skill","text":"相手の数字を永続で-4する。"},{"name":"大衝撃","pt":4,"ex":false,"category":"skill","text":"相手の数字-6する。お互い次出すとき1回メリット効果を使えない。"},{"name":"天才の戦技","pt":4,"ex":false,"category":"skill","text":"相手の数字-3する。〈異能〉以外のメリット効果を1つ選び発動させない。"},{"name":"無双","pt":4,"ex":false,"category":"skill","text":"デッキの異能者の数だけ数字+1、エネミーの数だけ相手の数字-1する。デッキの無能力者を全て永続で+1する。"},{"name":"AEF","pt":4,"ex":false,"category":"skill","text":"「機械」を発動して数字を5にする。以後「機械」として扱われ、無能力者でも〈異能〉を持てる。"},{"name":"スーパーノヴァ","pt":4,"ex":false,"category":"ability","text":"相手の数字-8する。"},{"name":"パルスホーミング","pt":4,"ex":false,"category":"ability","text":"相手デッキ4枚を選び、それぞれ永続で-1する。"},{"name":"煙炎漲天","pt":4,"ex":false,"category":"ability","text":"相手デッキ全てを3回、火傷状態にする。"},{"name":"狂瀾怒濤","pt":4,"ex":false,"category":"ability","text":"お互いのデッキ全てを不安定な状態と不運にする。"},{"name":"絶対零度","pt":4,"ex":false,"category":"ability","text":"お互いのカードを凍結状態にし、その後相手デッキ全てを凍結状態にする。"},{"name":"水天一碧","pt":4,"ex":false,"category":"ability","text":"場を水浸しにし相手の数字-4する（すでに水浸しなら自分と次の自分は相手からの状態異常以外を防ぐ）。"},{"name":"雷霆万鈞","pt":4,"ex":false,"category":"ability","text":"相手と相手デッキ1枚を麻痺状態にする。麻痺状態の相手からの効果を回避する。"},{"name":"鮮血淋漓","pt":4,"ex":false,"category":"ability","text":"これ以外のお互いのカードを全て出血状態にし、自分のカードのみ永続で+1する。"},{"name":"超音響砲","pt":4,"ex":false,"category":"ability","text":"自分とカード1枚を選び、デッキの音波の数と同じ数字になる効果を付与する。"},{"name":"疾風怒涛","pt":4,"ex":false,"category":"ability","text":"「風」として扱われる。味方4枚と相手4枚を選び、全てに風を付与する。"},{"name":"心腹之疾","pt":4,"ex":false,"category":"ability","text":"状態異常を1つ宣言。次のターン終了まで相手の感染状態・菌にその状態異常を追加し、自分の感染状態・菌はそれを回復する。"},{"name":"超身体強化","pt":4,"ex":false,"category":"ability","text":"数字+6する。"},{"name":"吸血","pt":4,"ex":false,"category":"ability","text":"出血状態を好きなだけ治す。治した数2つにつきEE+1、永続で数字+1する。"},{"name":"大変身","pt":4,"ex":false,"category":"ability","text":"自分の数字が8になる。"},{"name":"毒の王","pt":4,"ex":false,"category":"ability","text":"お互いの毒状態の累計経過ターン4ごとに必要EE-1し、その数字に変身する（出した次のターンは減らない）。次のターンの間、効果では負けない。"},{"name":"城壁錬成","pt":4,"ex":false,"category":"ability","text":"場が通常ならこの試合中、先手からの攻撃を全て防ぎ、攻撃した相手の数字を-1する。"},{"name":"身代わり","pt":4,"ex":false,"category":"ability","text":"味方が攻撃を受けるたび1つまで引き受けて無効化する。"},{"name":"ナイトメア","pt":4,"ex":false,"category":"ability","text":"夜空かつ元々睡眠状態のカードが出た時、割り込みで自分もバトル場に出る（元の数字は0、効果発動後に合算）。出た時、自分と味方の睡眠状態は次のターンに治り、相手は永続で治らなくなる。"},{"name":"大自然","pt":4,"ex":false,"category":"ability","text":"場を大自然にする。以後お互いは毒状態を除く状態異常にならず、回復する。"},{"name":"ブラックホール","pt":4,"ex":false,"category":"ability","text":"相手の数字4以上を全て選び、3ターン後にロストさせる。その後場を重力にする。"},{"name":"心領結界:名称","pt":4,"ex":false,"category":"ability","text":"場を3ターンの間その名称のフィールドにする。毎ターン、事前に選んだ1〜2ptの〈異能〉（EX除く）を発動して相手を永続で-1する（必中・上書き不可）。効果終了後1ターンの間〈異能〉を使えない。"},{"name":"異能極点:名称","pt":4,"ex":false,"category":"ability","text":"相手の数字-4し、事前に選んだ1〜2ptの〈異能〉（EX除く）を発動する（防御・常時効果を貫通）。次出すとき1回〈異能〉を使えない。"},{"name":"結界武装:名称","pt":4,"ex":false,"category":"ability","text":"事前に選んだ1〜2ptの〈異能〉（EX除く）を発動する。その後3ターンの間、数字+2し、相手からの〈異能〉を無効化する。効果終了後1ターンの間〈異能〉を使えない。"},{"name":"虚無","pt":4,"ex":true,"category":"ability","text":"EX効果。バトル相手を試合中ロストさせる。"},{"name":"歪曲","pt":4,"ex":true,"category":"ability","text":"EX効果。場を歪曲にする。以後お互いの+効果は-に、-効果は+に入れ替わる（状態異常は除く）。"},{"name":"敵霊顕現","pt":4,"ex":true,"category":"ability","text":"EX効果。デッキが全てエネミーかつメリット効果が〈異能〉のみなら、次のターンの間〈異能〉が全て2回発動する（重複しない）。"},{"name":"テレポート","pt":4,"ex":true,"category":"ability","text":"EX効果。デッキの味方と入れ替わってバトルする（数字・タイプは入れ替わった側を反映）。次のターンEE-1、次出すとき1回使用不可。"},{"name":"守護者","pt":4,"ex":true,"category":"ability","text":"EX効果。味方が攻撃される時、割り込みでデッキからバトルに出る（数字は合算せず効果のみ発動、次のターンは不発）。"},{"name":"一撃必殺","pt":6,"ex":false,"category":null,"text":"バトル相手を倒して勝つ。"},{"name":"超次元","pt":6,"ex":false,"category":null,"text":"自分の数字を+∞にする。"},{"name":"無敵","pt":6,"ex":false,"category":null,"text":"このカードはバトルで負けない。"},{"name":"滅亡","pt":6,"ex":false,"category":null,"text":"4ターン後、試合に勝利する。"},{"name":"降り注ぐ威光","pt":4,"ex":false,"category":"ability","text":"相手のカード全てを永続で-1する。"}];

export function sanitizeKey(str){ return str.trim().replace(/[.#$/\[\]]/g, '_'); }
export function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

// 端末から選んだ画像ファイルを、リアルタイムDBに収まるサイズまで縮小してdata URL化する
export function resizeImageToDataUrl(file, maxDim = 160, quality = 0.7){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('画像の読み込みに失敗しました。'));
        img.onload = () => {
          let { width, height } = img;
          if(width > height){
            if(width > maxDim){ height = Math.round(height * (maxDim/width)); width = maxDim; }
          } else {
            if(height > maxDim){ width = Math.round(width * (maxDim/height)); height = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

export function emptyCards(){
    return [0,1,2,3].map((_, idx) => ({ name:'', number: idx+1, species:'異能者', type:'atk', effectNames:[], flavor:'', image:null, used:false }));
  }
export function emptyDeck(){
    return { ready:false, cards: emptyCards() };
  }
export function effectByName(name){ return EFFECTS_CATALOG.find(e => e.name === name); }

export function ptGroupLabel(pt){
    if(pt < 0) return `${pt}pt（デメリット）`;
    return `${pt}pt`;
  }
export function buildEffectSelectOptions(){
    const groups = {};
    EFFECTS_CATALOG.forEach(e => {
      groups[e.pt] = groups[e.pt] || [];
      groups[e.pt].push(e);
    });
    const ptOrder = Object.keys(groups).map(Number).sort((a,b) => a-b);
    const catTag = (e) => e.category === 'ability' ? '〈異能〉' : e.category === 'skill' ? '〈技能〉' : '';
    return ptOrder.map(pt => {
      const opts = groups[pt].map(e => `<option value="${escapeHtml(e.name)}">${escapeHtml(e.name)}${catTag(e)}${e.ex ? '（EX）' : ''}</option>`).join('');
      return `<optgroup label="${ptGroupLabel(pt)}">${opts}</optgroup>`;
    }).join('');
  }

// 画面中央にモーダルカードを開き、検索・絞り込みしながら効果を1つ選ばせる。
// 選ばれた効果名を onSelect(name) に渡してモーダルを閉じる。
export function openEffectPickerModal(onSelect){
    const overlay = document.createElement('div');
    overlay.className = 'picker-overlay';
    overlay.innerHTML = `
      <div class="picker-modal">
        <div class="picker-header">
          <span>効果を選ぶ</span>
          <button type="button" class="picker-close" aria-label="閉じる">✕</button>
        </div>
        <input type="text" class="picker-search" placeholder="効果名や内容で検索…">
        <div class="picker-filters">
          <button type="button" class="picker-filter-btn selected" data-filter="all">すべて</button>
          <button type="button" class="picker-filter-btn" data-filter="ability">〈異能〉</button>
          <button type="button" class="picker-filter-btn" data-filter="skill">〈技能〉</button>
          <button type="button" class="picker-filter-btn" data-filter="neg">デメリット</button>
        </div>
        <div class="picker-grid"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const grid = overlay.querySelector('.picker-grid');
    const searchInput = overlay.querySelector('.picker-search');
    let activeFilter = 'all';

    function renderGrid(){
      const q = searchInput.value.trim();
      const filtered = EFFECTS_CATALOG.filter(e => {
        if(activeFilter === 'ability' && e.category !== 'ability') return false;
        if(activeFilter === 'skill' && e.category !== 'skill') return false;
        if(activeFilter === 'neg' && e.pt >= 0) return false;
        if(q && !(e.name.includes(q) || e.text.includes(q))) return false;
        return true;
      });
      grid.innerHTML = filtered.map(e => `
        <button type="button" class="picker-card" data-name="${escapeHtml(e.name)}">
          <div class="picker-card-head">
            <span class="picker-card-name">${escapeHtml(e.name)}${e.category==='ability'?'〈異能〉':e.category==='skill'?'〈技能〉':''}${e.ex?'（EX）':''}</span>
            <span class="picker-card-pt">${e.pt}pt</span>
          </div>
          <div class="picker-card-text">${escapeHtml(e.text)}</div>
        </button>
      `).join('') || '<p class="picker-empty">該当する効果が見つかりません。</p>';

      grid.querySelectorAll('.picker-card').forEach(btn => {
        btn.addEventListener('click', () => {
          onSelect(btn.dataset.name);
          close();
        });
      });
    }

    function close(){
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
    }
    function onKeydown(e){ if(e.key === 'Escape') close(); }

    overlay.querySelector('.picker-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
    document.addEventListener('keydown', onKeydown);
    searchInput.addEventListener('input', renderGrid);
    overlay.querySelectorAll('.picker-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.picker-filter-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        activeFilter = btn.dataset.filter;
        renderGrid();
      });
    });

    renderGrid();
    searchInput.focus();
  }
export function cardFormHtml(idx, card, effectsArr, isReadOnly){
    const used = effectsArr.reduce((sum, n) => { const e = effectByName(n); return sum + (e ? e.pt : 0); }, 0);
    const cardNumber = card.number;
    const overBudget = used > cardNumber;

    const chipsHtml = effectsArr.map(n => {
      const e = effectByName(n);
      if(!e) return '';
      return `
        <div class="effect-chip">
          <div class="ec-head">
            <span class="ec-name">${escapeHtml(e.name)}${e.category==='ability'?'〈異能〉':e.category==='skill'?'〈技能〉':''}${e.ex ? '（EX）' : ''}</span>
            <span class="ec-pt">${e.pt}pt</span>
            ${isReadOnly ? '' : `<button type="button" class="ec-remove" data-remove-effect data-i="${idx}" data-name="${escapeHtml(e.name)}">✕ 外す</button>`}
          </div>
          <div class="ec-text">${escapeHtml(e.text)}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="slot-label">数字 ${cardNumber}</div>
      <div class="card-image-row">
        <div class="card-image-preview" data-image-preview data-i="${idx}">${card.image ? `<img src="${card.image}" alt="">` : '画像なし'}</div>
        ${isReadOnly ? '' : `
          <div>
            <label>カード画像</label>
            <input type="file" accept="image/*" data-image-input data-i="${idx}">
            ${card.image ? `<button type="button" class="ghost-btn" data-remove-image data-i="${idx}">画像を外す</button>` : ''}
          </div>
        `}
      </div>
      <label>カード名</label>
      <input type="text" data-f="name" data-i="${idx}" value="${escapeHtml(card.name)}" ${isReadOnly?'disabled':''}>
      <label>種族</label>
      <select data-f="species" data-i="${idx}" ${isReadOnly?'disabled':''}>
        ${SPECIES_LIST.map(s => `<option value="${s}" ${card.species===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <label>タイプ</label>
      <select data-f="type" data-i="${idx}" ${isReadOnly?'disabled':''}>
        ${Object.entries(TYPE_LABEL).map(([k,v]) => `<option value="${k}" ${card.type===k?'selected':''}>${v}</option>`).join('')}
      </select>

      <label>効果</label>
      <div class="pt-budget ${overBudget?'over':''}">使用pt: ${used} ／ 数字上限: ${cardNumber}${overBudget ? '（超過しています）' : ''}</div>
      ${chipsHtml}
      ${isReadOnly ? '' : `
        <div class="effect-add-row">
          <button type="button" class="ghost-btn" data-open-effect-picker data-i="${idx}">＋ 効果を選ぶ</button>
        </div>
      `}

      <label>説明（フレーバー）</label>
      <input type="text" data-f="flavor" data-i="${idx}" value="${escapeHtml(card.flavor)}" ${isReadOnly?'disabled':''}>
    `;
  }
// 再描画（効果の追加・削除など）でグリッドを作り直す前に、
// 現在DOMに入力されている値（カード名・種族・タイプ・説明）をcards配列へ書き戻す。
// これをしないと、まだ保存していない入力中のテキストが再描画のたびに消えてしまう。
export function syncCardFieldsFromDom(gridEl, cards){
    if(!gridEl) return;
    cards.forEach((card, idx) => {
      const nameEl = gridEl.querySelector(`[data-f="name"][data-i="${idx}"]`);
      const speciesEl = gridEl.querySelector(`[data-f="species"][data-i="${idx}"]`);
      const typeEl = gridEl.querySelector(`[data-f="type"][data-i="${idx}"]`);
      const flavorEl = gridEl.querySelector(`[data-f="flavor"][data-i="${idx}"]`);
      if(nameEl) card.name = nameEl.value;
      if(speciesEl) card.species = speciesEl.value;
      if(typeEl) card.type = typeEl.value;
      if(flavorEl) card.flavor = flavorEl.value;
    });
  }

export function renderCardGrid(gridEl, cards, effectsState, isReadOnly, callbacks){
    gridEl.innerHTML = '';
    cards.forEach((card, idx) => {
      const div = document.createElement('div');
      div.className = 'card-form';
      div.innerHTML = cardFormHtml(idx, card, effectsState[idx] || [], isReadOnly);
      gridEl.appendChild(div);
    });
    gridEl.querySelectorAll('[data-image-input]').forEach(input => {
      input.addEventListener('change', async () => {
        const idx = parseInt(input.dataset.i, 10);
        const file = input.files && input.files[0];
        if(!file || !callbacks.onImageChange) return;
        try{
          const dataUrl = await resizeImageToDataUrl(file);
          callbacks.onImageChange(idx, dataUrl);
        } catch(err){
          console.error('画像処理に失敗しました', err);
        }
      });
    });
    gridEl.querySelectorAll('[data-remove-image]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.i, 10);
        if(callbacks.onImageChange) callbacks.onImageChange(idx, null);
      });
    });
    gridEl.querySelectorAll('[data-open-effect-picker]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.i, 10);
        openEffectPickerModal((name) => callbacks.onAddEffect(idx, name));
      });
    });
    gridEl.querySelectorAll('[data-remove-effect]').forEach(btn => {
      btn.addEventListener('click', () => {
        callbacks.onRemoveEffect(parseInt(btn.dataset.i, 10), btn.dataset.name);
      });
    });
  }
export function addEffectGeneric(effectsState, idx, name, cardNumber, errEl){
    errEl.textContent = '';
    if(!name) return false;
    const effects = effectsState[idx];
    const eff = effectByName(name);
    if(!eff) return false;
    if(effects.includes(name)){ errEl.textContent = '同じ効果は同じカードに重複してつけられません。'; return false; }
    if(effects.length >= 5){ errEl.textContent = '1枚のカードにつけられる効果は5個までです。'; return false; }
    const currentUsed = effects.reduce((sum, n) => { const e = effectByName(n); return sum + (e ? e.pt : 0); }, 0);
    if((currentUsed + eff.pt) > cardNumber){
      errEl.textContent = `pt上限を超えています（このカードの上限: ${cardNumber}pt）。`;
      return false;
    }
    if(eff.pt === -2 && effectsState.some((arr,i) => i!==idx && arr.some(n => { const e=effectByName(n); return e && e.pt===-2; }))){
      errEl.textContent = '-2ptの効果を持つカードはデッキに1枚までしか入れられません（他のカードに既についています）。';
      return false;
    }
    if(eff.pt === 6 && effectsState.some((arr,i) => i!==idx && arr.some(n => { const e=effectByName(n); return e && e.pt===6; }))){
      errEl.textContent = '6ptの効果を持つカードはデッキに1枚までしか入れられません（他のカードに既についています）。';
      return false;
    }
    const exCount = effectsState.reduce((sum,arr) => sum + arr.filter(n => { const e=effectByName(n); return e && e.ex; }).length, 0);
    if(eff.ex && exCount >= 1){ errEl.textContent = 'EX効果はデッキ全体で1枚までしか入れられません。'; return false; }
    if(eff.ex && effectsState.some(arr => arr.includes(name))){ errEl.textContent = '同じEX効果をデッキに複数入れることはできません。'; return false; }
    const totalEffects = effectsState.reduce((sum,arr) => sum + arr.length, 0);
    if(totalEffects >= 10){ errEl.textContent = 'デッキ全体の効果数は10個までです。'; return false; }
    effects.push(name);
    return true;
  }
export function validateDeckWide(cards){
    for(const c of cards){
      const used = (c.effectNames||[]).reduce((sum,n) => { const e = effectByName(n); return sum + (e?e.pt:0); }, 0);
      if(used > c.number){
        return `「${c.name || '無題のカード'}」の効果ptが数字の上限を超えています。`;
      }
      if((c.effectNames||[]).length > 5){
        return `「${c.name || '無題のカード'}」につけられる効果は5個までです。`;
      }
    }
    const totalEffects = cards.reduce((sum,c) => sum + (c.effectNames||[]).length, 0);
    if(totalEffects > 10){
      return `デッキ全体の効果数が10個を超えています（現在${totalEffects}個）。`;
    }
    const exNames = [];
    cards.forEach(c => (c.effectNames||[]).forEach(n => { const e = effectByName(n); if(e && e.ex) exNames.push(n); }));
    if(exNames.length > 1){
      return 'EX効果はデッキ全体で1枚までしか入れられません。';
    }
    if(new Set(exNames).size !== exNames.length){
      return '同じEX効果をデッキに複数入れることはできません。';
    }
    const cardsWithNeg2 = cards.filter(c => (c.effectNames||[]).some(n => { const e = effectByName(n); return e && e.pt === -2; }));
    if(cardsWithNeg2.length > 1){
      return '-2ptの効果を持つカードはデッキに1枚までしか入れられません。';
    }
    const cardsWith6 = cards.filter(c => (c.effectNames||[]).some(n => { const e = effectByName(n); return e && e.pt === 6; }));
    if(cardsWith6.length > 1){
      return '6ptの効果を持つカードはデッキに1枚までしか入れられません。';
    }
    const uniOrSpc = cards.filter(c => c.type === 'uni' || c.type === 'spc');
    if(uniOrSpc.length > 1){
      return 'デッキには万能🟡か特化🟣のどちらか1枚しか入れられません。';
    }
    if(uniOrSpc.some(c => c.number !== 1 && c.number !== 4)){
      return '万能🟡・特化🟣タイプは、数字1か4のカードにしかつけられません。';
    }
    for(const c of cards){
      const hasAbility = (c.effectNames||[]).some(n => { const e = effectByName(n); return e && e.category === 'ability'; });
      if(c.species === '無能力者' && hasAbility){
        return `「${c.name || '無題のカード'}」は無能力者なので〈異能〉効果を持てません。`;
      }
      if((c.species === '異能者' || c.species === 'エネミー') && !hasAbility){
        return `「${c.name || '無題のカード'}」は${c.species}なので〈異能〉効果を最低1つ持つ必要があります。`;
      }
    }
    return null;
  }

export function typeAdvantage(typeA, typeB){
    // 戻り値: 'A' | 'B' | null（有利側、なければnull）
    const cycle = { atk:'def', def:'spd', spd:'atk' };
    if(typeA==='spc' && typeB==='uni') return 'A';
    if(typeB==='spc' && typeA==='uni') return 'B';
    if(typeA==='spc' && ['atk','spd','def'].includes(typeB)) return 'B';
    if(typeB==='spc' && ['atk','spd','def'].includes(typeA)) return 'A';
    if(cycle[typeA] === typeB) return 'A';
    if(cycle[typeB] === typeA) return 'B';
    return null;
  }