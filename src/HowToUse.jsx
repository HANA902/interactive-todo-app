import { X, Plus, Calendar, Target, CheckCircle2, Eye, Archive, BarChart3, GripVertical, Edit2, Smartphone, Monitor, Lightbulb, TrendingUp } from 'lucide-react'

function HowToUse({ onClose }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="sticky top-0 bg-white border-b border-sand-300 p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-leaf-100 rounded-soft">
                <Lightbulb className="w-5 h-5 text-leaf-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">使い方ガイド</h2>
            </div>
            <button onClick={onClose} className="icon-btn p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            効率的なタスク管理で、毎週をスッキリ管理しましょう！
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* はじめに */}
          <section className="card-compact p-4 bg-leaf-50">
            <h3 className="text-lg font-bold text-leaf-900 mb-2">📌 My Weekly Flowとは？</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>週単位</strong>でタスクを管理するシンプルなアプリです。
              <br />月曜日から金曜日まで、曜日ごとに予定を整理して、効率よく一週間を過ごせます。
            </p>
            <div className="mt-3 p-3 bg-white rounded text-xs text-slate-600">
              💡 <strong>ポイント：</strong> アカウント登録不要！データはブラウザに保存されるので、すぐに使い始められます。
            </div>
          </section>

          {/* 基本的な使い方 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-leaf-500">基本的な使い方</h3>

            {/* 1. タスクを追加 */}
            <div className="space-y-4">
              <div className="card-compact p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-leaf-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">タスクを追加する</h4>
                    <p className="text-xs text-slate-600">画面上部のフォームから、新しいタスクを作成できます。</p>
                  </div>
                </div>
                <div className="bg-sand-50 p-3 rounded text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Plus className="w-4 h-4 text-leaf-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">入力項目</p>
                      <ul className="mt-1 space-y-1 text-slate-600 ml-4">
                        <li>• <strong>タスク名</strong>（必須）- 何をするか</li>
                        <li>• <strong>曜日</strong> - いつやるか（月〜金）</li>
                        <li>• <strong>タグ</strong> - 種類分け（例: 会議, 資料作成）</li>
                        <li>• <strong>期日</strong> - 締切日</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. タスクを編集 */}
              <div className="card-compact p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-leaf-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">タスクを編集する</h4>
                    <p className="text-xs text-slate-600">登録済みのタスクも後から修正できます。</p>
                  </div>
                </div>
                <div className="bg-sand-50 p-3 rounded text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Edit2 className="w-4 h-4 text-leaf-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">編集方法</p>
                      <ol className="space-y-1 text-slate-600 ml-4 list-decimal">
                        <li>タスクカードをクリックして展開</li>
                        <li>右上の「...」メニューから「編集」を選択</li>
                        <li>内容を修正して「保存」ボタンをクリック</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. サブタスク */}
              <div className="card-compact p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-leaf-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">サブタスクで細かく分ける</h4>
                    <p className="text-xs text-slate-600">大きなタスクを小さなステップに分けて、進みやすくしましょう。</p>
                  </div>
                </div>
                <div className="bg-sand-50 p-3 rounded text-xs space-y-2">
                  <p className="text-slate-700"><strong>例：</strong>「プレゼン資料作成」というタスクを...</p>
                  <ul className="space-y-1 text-slate-600 ml-4">
                    <li>✓ 構成を考える</li>
                    <li>✓ スライドを作る</li>
                    <li>✓ レビュー依頼</li>
                    <li>✓ 修正する</li>
                  </ul>
                  <p className="text-slate-600 pt-2 border-t">
                    <CheckCircle2 className="w-3 h-3 inline" /> チェックマークで進捗が可視化されます！
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 効率的な活用方法 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-leaf-500 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-leaf-600" />
              効率的な活用方法
            </h3>

            <div className="space-y-4">
              {/* ヒント1 */}
              <div className="card-compact p-4 border-l-4 border-leaf-500">
                <h4 className="font-bold text-slate-900 mb-2">💡 週の始めに計画を立てる</h4>
                <p className="text-xs text-slate-600 mb-2">
                  月曜日の朝に、一週間のタスクをまとめて登録すると効率的です。
                </p>
                <div className="bg-sand-50 p-2 rounded text-xs text-slate-700">
                  <strong>おすすめ：</strong> 重要なタスクは週の前半（月〜水）に配置すると、余裕を持って対応できます。
                </div>
              </div>

              {/* ヒント2 */}
              <div className="card-compact p-4 border-l-4 border-leaf-500">
                <h4 className="font-bold text-slate-900 mb-2">💡 1日のタスク量を調整する</h4>
                <p className="text-xs text-slate-600 mb-2">
                  予定を詰め込みすぎると、空が曇ってしまいます☁️
                </p>
                <div className="bg-sand-50 p-2 rounded text-xs text-slate-700">
                  <strong>目安：</strong> 1日3〜5個のタスクが理想的。多すぎると感じたら、ドラッグ&ドロップで別の日に移動しましょう。
                </div>
              </div>

              {/* ヒント3 */}
              <div className="card-compact p-4 border-l-4 border-leaf-500">
                <h4 className="font-bold text-slate-900 mb-2">💡 タグで分類する</h4>
                <p className="text-xs text-slate-600 mb-2">
                  タグを使うと、タスクの種類が一目でわかります。
                </p>
                <div className="bg-sand-50 p-2 rounded text-xs space-y-1">
                  <p className="text-slate-700"><strong>例：</strong></p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">会議</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">資料作成</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">レビュー</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">メール対応</span>
                  </div>
                </div>
              </div>

              {/* ヒント4 */}
              <div className="card-compact p-4 border-l-4 border-leaf-500">
                <h4 className="font-bold text-slate-900 mb-2">💡 毎日確認する習慣をつける</h4>
                <p className="text-xs text-slate-600">
                  朝に「今日のタスク」ビューで確認すると、1日の流れが掴めます。
                  夕方に完了タスクを見返すと、達成感が得られます！
                </p>
              </div>
            </div>
          </section>

          {/* 便利な機能 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-leaf-500">便利な機能</h3>

            <div className="space-y-3">
              {/* ドラッグ&ドロップ */}
              <div className="bg-sand-50 p-3 rounded-soft">
                <div className="flex items-start gap-3 mb-2">
                  <GripVertical className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">ドラッグ&ドロップで移動</p>
                    <p className="text-xs text-slate-600 mt-1">
                      <Monitor className="w-3 h-3 inline" /> <strong>PC：</strong> カードをドラッグして別の曜日に移動
                      <br />
                      <Smartphone className="w-3 h-3 inline" /> <strong>モバイル：</strong> 右スワイプで完了、左スワイプで翌日へ
                    </p>
                  </div>
                </div>
              </div>

              {/* ビュー切り替え */}
              <div className="bg-sand-50 p-3 rounded-soft">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex gap-2 flex-shrink-0">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <Target className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">2つの表示モード</p>
                    <p className="text-xs text-slate-600 mt-1">
                      • <strong>カンバンボード：</strong> 週全体を一覧
                      <br />
                      • <strong>今日のタスク：</strong> 今日の予定だけに集中
                    </p>
                  </div>
                </div>
              </div>

              {/* 完了タスク管理 */}
              <div className="bg-sand-50 p-3 rounded-soft">
                <div className="flex items-start gap-3 mb-2">
                  <Eye className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">完了タスクの管理</p>
                    <p className="text-xs text-slate-600 mt-1">
                      目アイコンで完了タスクの表示/非表示を切り替え。
                      <br />
                      不要になったタスクは「履歴」に移動できます。
                    </p>
                  </div>
                </div>
              </div>

              {/* 週次サマリー */}
              <div className="bg-sand-50 p-3 rounded-soft">
                <div className="flex items-start gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">週次サマリー</p>
                    <p className="text-xs text-slate-600 mt-1">
                      金曜日に確認すると、一週間の達成度がわかります。
                      <br />
                      完了率が見えるとモチベーションアップ！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* よくある使い方の例 */}
          <section className="card-compact p-4 bg-gradient-to-r from-leaf-50 to-sand-50">
            <h3 className="text-sm font-bold text-slate-900 mb-3">📝 よくある使い方の例</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2 bg-white rounded">
                <strong>営業職：</strong> 月曜に顧客訪問、火曜に提案書作成、水曜にフォローアップ...と予定を整理
              </div>
              <div className="p-2 bg-white rounded">
                <strong>エンジニア：</strong> タグで「開発」「レビュー」「ミーティング」を分類して進捗管理
              </div>
              <div className="p-2 bg-white rounded">
                <strong>学生：</strong> 課題の締切を期日に設定して、サブタスクでステップを管理
              </div>
            </div>
          </section>

          {/* 注意事項 */}
          <section className="card-compact p-4 bg-sand-50 border-l-4 border-slate-400">
            <h3 className="text-sm font-bold text-slate-900 mb-2">⚠️ 注意事項</h3>
            <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
              <li>データはブラウザに保存されます（他のデバイスとは同期しません）</li>
              <li>ブラウザのデータを削除すると、タスクも消えます</li>
              <li>大切なタスクは定期的にメモやスクリーンショットでバックアップを</li>
            </ul>
          </section>

          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            わかりました
          </button>
        </div>
      </div>
    </>
  )
}

export default HowToUse
