# 検閲システム再設計：現時点の課題と解決方針

この文書は、`feature/censorship-region-redesign` の現時点で判明している課題を、今後の実装・セッション引き継ぎ用に記録する。

## 1. 基本方針

検閲領域は次の2種類を完全に分離する。

- **Model型**：3Dモデル上の特定箇所に追従する。モデル移動・ボーン変形に追従し、カメラズーム時はモデルと同じ倍率で見える。3D空間上のサイズを持つ。Billboard ON/OFFを持つ。
- **Screen型**：画面に固定する。カメラ移動・ズームの影響を受けず、画面座標・画面サイズを維持する。

Model型のRegionそのものを2D Rectとして保存しない。画面上の投影Rectは編集・マスク生成のための一時的な情報とする。

## 2. 現時点の判定・課題

### C-01: GitHub Actionsでfeatureブランチのpushが自動Buildされない
- **判定**：未解決
- **原因**：現在のBuild workflowは`main`へのpushと`main`向けPR、手動実行を対象としている。
- **影響**：featureブランチへpushしてもBuild結果を自動確認できない。
- **推奨解決策**：当面は`feature/censorship-region-redesign`から`main`へのDraft PRを作成してBuildを発火させる。将来的にfeatureブランチもpush Build対象にするかは別途判断。
- **完了条件**：Actionsで`npm run build`が実行され、成功する。

### C-02: TypeScriptの型検査が緩い
- **判定**：未解決（直ちにstrict化はしない）
- **現状**：`strict: false`、`skipLibCheck: true`。
- **影響**：Build成功でも型設計上の問題を見逃す可能性がある。
- **推奨解決策**：まず現行設定でBuildを通す。その後、検閲系コードに限定して型安全性を改善する。プロジェクト全体のstrict化は別タスク。
- **完了条件**：現行Buildがgreen。その後、検閲関連APIの型を整理。

### C-03: Model型の移動・リサイズは画面操作から3D値へ変換している
- **判定**：実装済みだが要検証
- **問題**：Perspective camera、斜視、Billboard OFF、画面端などで操作量と3Dサイズ/移動量に誤差が出る可能性。
- **推奨解決策**：実機確認で操作感を確認。必要ならRay-plane intersectionを基準とした3D編集計算を厳密化する。リサイズも画面比率だけでなく編集平面上の実寸変化から計算する。
- **完了条件**：カメラ位置・ズーム・角度を変えても、移動とリサイズが直感的に動く。

### C-04: Model型の検閲マスクが3D図形そのものではなく投影Bounding Rectベース
- **判定**：未解決・重要
- **問題**：3D Planeを作っても、現在の検閲効果は投影した外接RectをShaderへ渡す方式。回転したPlaneでは、実際の図形より広い範囲が検閲される可能性がある。
- **推奨解決策**：3D検閲図形をscreen-space maskへ正確に変換する。最終的にはPlaneの4頂点から2Dポリゴン/マスクを生成し、外接Rectではなく実形状でモザイク領域を決める。Ellipse等は別途形状情報を渡す。
- **完了条件**：斜め回転した検閲Planeでも、検閲範囲がPlaneの形状と一致する。

### C-05: MMDボーン追従を最終仕様として厳密化する必要がある
- **判定**：未解決・重要
- **問題**：現行のModel型は対象Objectへローカル座標でAttachする設計。MMDのボーン変形・モーション再生時に「特定身体部位」に正確に追従する仕組みは要検証。
- **推奨解決策**：MMDのSkinnedMesh/Bone階層を確認し、boneNameをBindingとして保存。検閲Objectを対象Boneの子、またはBoneのworld transformから正しく更新する専用Bindingを作る。Meshへの単純Attachだけを最終仕様にしない。
- **完了条件**：モーション再生・ポーズ変更・モデル移動のすべてで対象部位に検閲が追従する。

### C-06: Project保存/読み込みへのRegion統合
- **判定**：未完成
- **問題**：新しいCensorshipRegionのModel/Screen設定がProjectStoreの保存・復元フローに完全統合されているか未確認。
- **推奨解決策**：Project schemaにcensorshipRegionsを追加し、Model binding、local transform、size、billboard、Screen rect、effect、enabled等を保存/復元する。
- **完了条件**：検閲を配置→保存→再読み込みして、位置・サイズ・回転・Billboard・対象Binding・効果が復元される。

### C-07: Shape定義とShader実装範囲の不一致
- **判定**：未完成
- **現状**：rectangle/ellipse/circle等の定義がある一方、描画側の対応範囲は限定的。customは未実装。
- **推奨解決策**：まずRectangleを完成・安定化。次にEllipse/Circle。Customは仕様確定後に実装。
- **完了条件**：UIで選べるShapeと実際の描画結果が一致する。

### C-08: 古い2D投影系コードの整理
- **判定**：未整理
- **問題**：旧`BoneRegionTracker`、`BoneBoundRegionTracker`、`RegionEditorModel`、旧Frame/Overlay系など、旧設計のコードが残っている可能性がある。
- **推奨解決策**：新設計への移行完了後、参照元を検索して未使用コードを確認。不要なら削除。削除前にBuildを通して依存関係を確認する。
- **完了条件**：旧2D投影方式が実行経路に残っていない。不要ファイルが整理されている。

### C-09: Model型編集UIの実機確認
- **判定**：コード上は実装済み、実機未確認
- **対象**：選択、移動、リサイズ、回転、Billboard ON/OFF。
- **推奨解決策**：出先から戻った後に実機確認。特にハンドルの掴みやすさ、カメラズーム中の操作、Billboard切替、斜視状態を確認。
- **完了条件**：基本操作が直感的で、Regionがモデルから浮かない。

### C-10: Screen型編集UIの実機確認
- **判定**：コード上は実装済み、実機未確認
- **推奨解決策**：Screen Regionの移動・四隅リサイズ・カメラ操作との独立性を確認。
- **完了条件**：カメラを動かしてもScreen Regionが同じ画面位置・サイズを維持する。

## 3. 優先順位

### 最優先
1. **C-01 Buildを実際に回す**
2. **Buildエラーを全件修正**
3. **C-06 Project保存/復元**
4. **C-05 MMDボーン追従を確認・完成**
5. **C-04 3D形状を正確なマスクとして使用**

### 次点
6. C-03 Model編集操作の精度改善
7. C-07 Shape対応整理
8. C-08 旧コード整理
9. C-09/C-10 実機操作確認

## 4. 今後のセッション引き継ぎ用メモ

現在の作業ブランチ：`feature/censorship-region-redesign`

`main`には直接変更を入れない。

現在は「Model型/Screen型を分離した新設計」が基準。旧2D Rect中心設計へ戻さない。

次の実装者は、まずこの文書とGitHub ActionsのBuild結果を確認する。実機確認できない場合でも、コードレビュー・Build・保存/復元・Binding設計を先に進めてよい。

「問題がある」だけで止めず、各課題について必ず**原因 → 推奨解決策 → 完了条件**まで確認してから実装する。
