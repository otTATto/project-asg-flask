def detect(cap):

    #install numpy==1.26.2
    #install scikit-learn==1.2.2 (古いバージョンに変更する)

    import cv2
    import dlib
    import numpy as np
    import imutils
    from imutils import face_utils
    import os
    import pandas as pd

    detector = dlib.get_frontal_face_detector()
    predictor = dlib.shape_predictor("static/src/dat/shape_predictor_68_face_landmarks.dat")

    def calculate_gaze_ratio(eye_points, facial_landmarks, frame):
 
        region = np.array([(facial_landmarks.part(point).x, facial_landmarks.part(point).y) for point in eye_points])

        height, width = frame.shape[:2]
        mask = np.zeros((height, width), np.uint8)
        cv2.polylines(mask, [region], True, 255, 2)
        cv2.fillPoly(mask, [region], 255)
        eye = cv2.bitwise_and(frame, frame, mask=mask)

        gray_eye = cv2.cvtColor(eye, cv2.COLOR_BGR2GRAY)
        _, threshold_eye = cv2.threshold(gray_eye, 70, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(threshold_eye, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        contours = sorted(contours, key=lambda x: cv2.contourArea(x), reverse=True)
        for cnt in contours:
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                return (cx, cy)
        return None


    def main1(frame):                                                      #左右の瞳の中心座標(タプルのタプル)

        # グレースケール画像を取得
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 顔を検出
        faces = detector(gray)
        for face in faces:
            # 顔のランドマークを検出
            landmarks = predictor(gray, face)

            # 左目と右目のポイントを取得
            left_eye_points = [ 37, 38, 39, 40, 41,42]
            right_eye_points = [ 43, 44, 45, 46, 47, 48]

            # 視線の比率を計算
            gaze_ratio_left_eye = calculate_gaze_ratio(left_eye_points, landmarks, frame)
            gaze_ratio_right_eye = calculate_gaze_ratio(right_eye_points, landmarks, frame)

            if gaze_ratio_left_eye and gaze_ratio_right_eye:
                gaze_ratio = ((gaze_ratio_left_eye[0] + gaze_ratio_right_eye[0]) // 2, (gaze_ratio_left_eye[1] + gaze_ratio_right_eye[1]) // 2)

                # [調整が必要] ここで視線の座標を画面の座標に変換します。
                # この変換は、ユーザーの頭の位置、カメラの角度、スクリーンのサイズに依存します。

            # 黒目の輪郭を検出
                gray_eye = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                _, threshold_eye = cv2.threshold(gray_eye, 70, 255, cv2.THRESH_BINARY)
                contours, _ = cv2.findContours(threshold_eye, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            # 最大の輪郭を取得
                if contours:
                    max_contour = max(contours, key=cv2.contourArea)
                    M = cv2.moments(max_contour)
                    if M['m00'] != 0:
                        cx = int(M['m10'] / M['m00'])
                        cy = int(M['m01'] / M['m00'])
                        return (gaze_ratio_right_eye, gaze_ratio_left_eye)

                    else:
                        return
                else:
                    return


    def main2(frame):                                                         #眉毛の位置(右、左の順で)(タプルのリスト)
        # グレースケール画像を取得
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 顔を検出
        faces = detector(gray)
        for face in faces:
            # 顔のランドマークを検出
            landmarks = predictor(gray, face)

            return [(landmarks.part(22).x, landmarks.part(22).y),(landmarks.part(23).x, landmarks.part(23).y)]

    def calculate_eye_aspect_ratio(eye_landmarks):
        # 縦の距離を計算（上と下）
        v1 = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        v2 = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])

        # 横の距離を計算（左と右）
        h = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])

        # 縦と横の比率を計算
        ear = (v1 + v2) / (2.0 * h)

        return ear

    def main3(frame):                                                                  #左瞼の大きさ、右瞼の大きさ、平均の瞼の大きさ(タプル)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        if len(faces) == 0:
            return

        landmarks = predictor(gray, faces[0])
        left_eye_landmarks = np.array([[p.x, p.y] for p in landmarks.parts()[36:42]])
        right_eye_landmarks = np.array([[p.x, p.y] for p in landmarks.parts()[42:48]])

        left_ear = calculate_eye_aspect_ratio(left_eye_landmarks)
        right_ear = calculate_eye_aspect_ratio(right_eye_landmarks)

        # 両目の開き具合を平均
        average_ear = (left_ear + right_ear) / 2

        return (left_ear, right_ear, average_ear)

    def main4(frame):                                                         #瞼の中心座標(リストのリスト)

        # グレースケール画像を取得
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # 顔を検出
        faces = detector(gray)
        for face in faces:
            # 顔のランドマークを検出
            landmarks = predictor(gray, face)

            # 左目と右目のポイントを取得
            left_eye_points = [ 37, 38, 39, 40, 41,42]
            right_eye_points = [ 43, 44, 45, 46, 47, 48]
            average_left = [0,0]
            average_right = [0,0]
            for i in left_eye_points:
                average_left[0] += landmarks.part(i).x
                average_left[1] += landmarks.part(i).y

            for j in right_eye_points:
                average_right[0] += landmarks.part(j).x
                average_right[1] += landmarks.part(j).y

            return [ average_left , average_right]

    def main5(frame):                                                            #頭部姿勢データの取り出し(yell,pitch,rollのリスト)

        # 顔検出
        frame = imutils.resize(frame, width=1000)  # 画像のリサイズ
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector(gray)

        # 顔が検出されない場合はデフォルトの値を返す
        if len(faces) == 0:
            return 0, 0, 0

        landmarks = predictor(gray, faces[0])
        shape = face_utils.shape_to_np(landmarks)

        image_points = np.array([
            tuple(shape[30]),  # 鼻頭
            tuple(shape[21]),
            tuple(shape[22]),
            tuple(shape[39]),
            tuple(shape[42]),
            tuple(shape[31]),
            tuple(shape[35]),
            tuple(shape[48]),
            tuple(shape[54]),
            tuple(shape[57]),
            tuple(shape[8]),
        ], dtype='double')

        model_points = np.array([
            (0.0,0.0,0.0),  # 30
            (-30.0,-125.0,-30.0),  # 21
            (30.0,-125.0,-30.0),  # 22
            (-60.0,-70.0,-60.0),  # 39
            (60.0,-70.0,-60.0),  # 42
            (-40.0,40.0,-50.0),  # 31
            (40.0,40.0,-50.0),  # 35
            (-70.0,130.0,-100.0),  # 48
            (70.0,130.0,-100.0),  # 54
            (0.0,158.0,-10.0),  # 57
            (0.0,250.0,-50.0)  # 8
        ])

        size = frame.shape

        focal_length = size[1]
        center = (size[1] // 2, size[0] // 2)
        camera_matrix = np.array([
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ], dtype='double')

        dist_coeffs = np.zeros((4, 1))  # 全ての要素がゼロの配列を作成

        (_, rotation_vector, translation_vector) = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE)

        # 回転行列とヤコビアン
        (rotation_matrix, jacobian) = cv2.Rodrigues(rotation_vector)
        mat = np.hstack((rotation_matrix, translation_vector))

        # yaw, pitch, rollの取り出し
        (_, _, _, _, _, _, eulerAngles) = cv2.decomposeProjectionMatrix(mat)
        yaw = eulerAngles[1]
        pitch = eulerAngles[0]
        roll = eulerAngles[2]

        return [int(yaw),int(pitch),int(roll)]           # 頭部姿勢データの取り出し


    gaze_ratio_right_eye_x = []
    gaze_ratio_right_eye_y = []
    gaze_ratio_left_eye_x = []
    gaze_ratio_left_eye_y = []
    eyebraw_right_x = []
    eyebraw_right_y = []
    eyebraw_left_x = []
    eyebraw_left_y = []
    left_open_eye_ratio = []
    right_open_eye_ratio = []
    mabuta_right_x = []
    mabuta_right_y = []
    mabuta_left_x = []
    mabuta_left_y = []
    yall = []
    pitch = []
    roll = []

    # 開始時間（0秒後）
    start_time = 0

    # 抜き出し間隔（1秒間隔）
    frame_interval = 1

    # 経過時間上限（10秒）
    end_time = start_time + 10


    # フレームレート取得
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    # 開始フレームと終了フレームを計算
    start_frame = start_time * fps

    frame_count = 0

    # フレームを読み込んで指定の間隔で保存
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count >= start_frame:
            # 経過時間を計算
            elapsed_time = (frame_count - start_frame) / fps

            # 10秒経過したら終了
            if elapsed_time > end_time:
                break

            if elapsed_time % frame_interval == 0:
                # フレームを出力
                result1 = main1(frame)
                if result1 is not None:
                    ((a,b),(c,d)) = result1
                    gaze_ratio_right_eye_x.append(a)
                    gaze_ratio_right_eye_y.append(b)
                    gaze_ratio_left_eye_x.append(c)
                    gaze_ratio_left_eye_y.append(d)

                result2 = main2(frame)
                if result2 is not None:
                    [(a, b), (c, d)] = result2
                    eyebraw_right_x.append(a)
                    eyebraw_right_y.append(b)
                    eyebraw_left_x.append(c)
                    eyebraw_left_y.append(d)

                result3 = main3(frame)
                if result3 is not None:
                    (a, b, _) = result3
                    left_open_eye_ratio.append(a)
                    right_open_eye_ratio.append(b)

                result4 = main4(frame)
                if result4 is not None:
                    [[x, y], [z, s]] = result4
                    mabuta_right_x.append(x)
                    mabuta_right_y.append(y)
                    mabuta_left_x.append(z)
                    mabuta_left_y.append(s)

                result5 = main5(frame)
                if result5 is not None:
                    [y, p, r] = result5
                    yall.append(y)
                    pitch.append(p)
                    roll.append(r)
        frame_count += 1

    # キャプチャを解放
    cap.release()

    df = pd.DataFrame({'right_center_eye_x': gaze_ratio_right_eye_x,'right_center_eye_y': gaze_ratio_right_eye_y, 'left_center_eye_x': gaze_ratio_left_eye_x, 'left_center_eye_y': gaze_ratio_left_eye_y,'eyebraw1_right_x' :  eyebraw_right_x ,'eyebraw1_right_y': eyebraw_right_y,  'eyebraw1_left_x': eyebraw_left_x, 'eyebraw1_left_y': eyebraw_left_y, 'right_openeye_ratio': right_open_eye_ratio, 'left_openeye_ratio' :  left_open_eye_ratio, 'mabuta1_right_x': mabuta_right_x, 'mabuta1_right_y': mabuta_right_y, 'mabuta1_left_x' : mabuta_left_x, 'mabuta1_left_y' : mabuta_left_y, 'yall1' : yall, 'pitch1' : pitch, 'roll1': roll })

    def process_dataframe(df):
        import pandas as pd
        import matplotlib.pyplot as plt 
        from sklearn.model_selection import train_test_split 
        x_df = df 
        y_df = df

        x_df.astype(float) 
        y_df.astype(float)

        x_df['mabuta1_right_x'] = x_df['mabuta1_right_x'] / 6 
        x_df['mabuta1_right_y'] = x_df['mabuta1_right_y'] / 6
        x_df['mabuta1_left_x'] = x_df['mabuta1_left_x'] / 6
        x_df['mabuta1_left_y'] = x_df['mabuta1_left_y'] / 6

        y_df['mabuta1_right_x'] = y_df['mabuta1_right_x'] / 6
        y_df['mabuta1_right_y'] = y_df['mabuta1_right_y'] / 6
        y_df['mabuta1_left_x'] = y_df['mabuta1_left_x'] / 6
        y_df['mabuta1_left_y'] = y_df['mabuta1_left_y'] / 6

        test1 = x_df 
        test = y_df

        import pickle
        model_path = "static/src/pkl/model_x_3.pkl" 
        model_path1 = "static/src/pkl/model_sc_1.pkl"
        model_path2 = "static/src/pkl/model_y_1.pkl"
        model_path3 = "static/src/pkl/model_y_sc_1.pkl"

        with open(model_path, 'rb') as file:
            model1 = pickle.load(file) 

        with open(model_path1, 'rb') as file:
            sc1 = pickle.load(file)

        with open(model_path2, 'rb') as file:
            model2 = pickle.load(file)

        with open(model_path3, 'rb') as file:
            sc2 = pickle.load(file)

        test1['distance_eyebraw_x'] = test1['eyebraw1_left_x'] - test1['eyebraw1_right_x']
        test1['distance_eyebraw_y'] = test1['eyebraw1_right_y'] - test1['eyebraw1_left_y']
        test1['relative_eye_position_x'] = test1['right_center_eye_x'] - test1['mabuta1_right_x']
        test1['relative_eye_position_y'] = test1['right_center_eye_y'] - test1['mabuta1_right_y']
        test1 = test1.drop(['right_center_eye_x', 'right_center_eye_y', 'left_center_eye_x','left_center_eye_y', 'eyebraw1_right_x', 'eyebraw1_right_y','eyebraw1_left_x', 'eyebraw1_left_y', 'mabuta1_right_x', 'mabuta1_right_y','mabuta1_left_x', 'mabuta1_left_y'],axis = 1)
        test1['yall*2'] = test1['yall1'] ** 2
        test1['pitch1*2'] = test1['pitch1'] ** 2
        test1['roll1*2'] = test1['roll1'] ** 2

        test1['distance_eyebraw_x*2'] = test1['distance_eyebraw_x'] ** 2
        test1['distance_eyebraw_y*2'] = test1['distance_eyebraw_y'] ** 2
        test1['relative_eye_position_x*2'] = test1['relative_eye_position_x'] ** 2
        test1['relative_eye_position_y*2'] = test1['relative_eye_position_y'] ** 2

        test1['yall*roll*pitch'] = test1['yall1'] * test1['pitch1'] * test1['roll1']

        test1['ratio_distance_x'] = test1['relative_eye_position_x'] / test1['distance_eyebraw_x']
        test1['ratio_distance_y'] = test1['relative_eye_position_y'] / test1['distance_eyebraw_y']

        mid_basic_x = test1['ratio_distance_x'].median() 
        mid_basic_y = test1['ratio_distance_y'].median()

        condition1 = test1['relative_eye_position_x'] < -100 
        condition2 = test1['relative_eye_position_y'] > 50 
        condition3 = test1['distance_eyebraw_x'] > 100
        condition4 = test1['distance_eyebraw_y'] > 50

        combined_condition = condition1 & condition2 & condition3 & condition4 

        if combined_condition.any(): 

            test1[condition1 & condition2 & condition3 & condition4 ]['relative_eye_position_x'] = test1['relative_eye_position_x'].median()
            test1[condition1 & condition2 & condition3 & condition4 ]['relative_eye_position_y'] = test1['relative_eye_position_y'].median()
            test1[condition1 & condition2 & condition3 & condition4 ]['distance_eyebraw_x'] = test1['distance_eyebraw_x'].median()
            test1[condition1 & condition2 & condition3 & condition4 ]['distance_eyebraw_y'] = test1['distance_eyebraw_y'].median()
        elif condition1.any() and condition2.any(): 
            test1[condition1 & condition2 ]['relative_eye_position_x'] = test1[condition1 & condition2 ]['distance_eyebraw_x'] * mid_basic_x
            test1[condition1 & condition2 ]['relative_eye_position_y'] = test1[condition1 & condition2 ]['relative_eye_position_y'] * mid_basic_y

        col1 = ['right_openeye_ratio', 'left_openeye_ratio', 'yall1', 'pitch1', 'roll1','distance_eyebraw_x', 'distance_eyebraw_y',
            'relative_eye_position_x', 'relative_eye_position_y', 'yall*2',
            'pitch1*2', 'roll1*2', 'distance_eyebraw_x*2', 'distance_eyebraw_y*2',
            'relative_eye_position_x*2', 'relative_eye_position_y*2',
            'yall*roll*pitch']

        from sklearn.preprocessing import PowerTransformer
        pt = PowerTransformer(method = 'yeo-johnson')
        pt.fit(test1[col1])

        test1[col1] = pt.transform(test1[col1])
        test1 = test1.drop(['ratio_distance_x', 'ratio_distance_y'], axis=1)

        test1[col1] = sc1.transform(test1[col1])
        from sklearn.cluster import KMeans
        model = KMeans(n_clusters=7, random_state=0)
        model.fit(test1[col1])
        test1["cluster"] = model.labels_

        test1.columns
        col2 = ['cluster','right_openeye_ratio', 'left_openeye_ratio', 'yall1', 'pitch1', 'roll1', 'distance_eyebraw_x', 'distance_eyebraw_y', 'relative_eye_position_x', 'relative_eye_position_y', 'yall*2','pitch1*2', 'roll1*2', 'distance_eyebraw_x*2', 'distance_eyebraw_y*2','relative_eye_position_x*2', 'relative_eye_position_y*2','yall*roll*pitch']
        test1 = test1[col2]

        pred_x1 = model1.predict(test1) 

        test['distance_eyebraw_x'] = test['eyebraw1_left_x'] - test['eyebraw1_right_x']
        test['distance_eyebraw_y'] = test['eyebraw1_right_y'] - test['eyebraw1_left_y']
        test['relative_eye_position_x'] = test['right_center_eye_x'] - test['mabuta1_right_x']
        test['relative_eye_position_y'] = test['right_center_eye_y'] - test['mabuta1_right_y']
        test = test.drop(['right_center_eye_x', 'right_center_eye_y', 'left_center_eye_x','left_center_eye_y', 'eyebraw1_right_x', 'eyebraw1_right_y','eyebraw1_left_x', 'eyebraw1_left_y', 'mabuta1_right_x', 'mabuta1_right_y','mabuta1_left_x', 'mabuta1_left_y'],axis = 1)
        test['yall*2'] = test['yall1'] ** 2
        test['pitch1*2'] = test['pitch1'] ** 2
        test['roll1*2'] = test['roll1'] ** 2
        test['distance_eyebraw_x*2'] = test['distance_eyebraw_x'] ** 2
        test['distance_eyebraw_y*2'] = test['distance_eyebraw_y'] ** 2
        test['relative_eye_position_x*2'] = test['relative_eye_position_x'] ** 2
        test['relative_eye_position_y*2'] = test['relative_eye_position_y'] ** 2
        test['yall*roll*pitch'] = test['yall1'] * test['pitch1'] * test['roll1']
        test['ratio_distance_x'] = test['relative_eye_position_x'] / test['distance_eyebraw_x']
        test['ratio_distance_y'] = test['relative_eye_position_y'] / test['distance_eyebraw_y']
        mid_basic_x = test['ratio_distance_x'].median()
        mid_basic_y = test['ratio_distance_y'].median()
        condition1 = test['relative_eye_position_x'] < -100
        condition2 = test['relative_eye_position_y'] > 50
        condition3 = test['distance_eyebraw_x'] > 100
        condition4 = test['distance_eyebraw_y'] > 50

        combined_condition = condition1 & condition2 & condition3 & condition4

        if combined_condition.any():
            test[condition1 & condition2 & condition3 & condition4 ]['relative_eye_position_x'] = test['relative_eye_position_x'].median()
            test[condition1 & condition2 & condition3 & condition4 ]['relative_eye_position_y'] = test['relative_eye_position_y'].median()
            test[condition1 & condition2 & condition3 & condition4 ]['distance_eyebraw_x'] = test['distance_eyebraw_x'].median()
            test[condition1 & condition2 & condition3 & condition4 ]['distance_eyebraw_y'] = test['distance_eyebraw_y'].median()
        if condition1.any() and condition2.any():
            test[condition1 & condition2 ]['relative_eye_position_x'] = test[condition1 & condition2 ]['distance_eyebraw_x'] * mid_basic_x
            test[condition1 & condition2 ]['relative_eye_position_y'] = test[condition1 & condition2 ]['relative_eye_position_y'] * mid_basic_y

        from sklearn.preprocessing import PowerTransformer
        pt = PowerTransformer(method = 'yeo-johnson')
        pt.fit(test[col1])
        test[col1] = pt.transform(test[col1])

        test[col1] = sc2.transform(test[col1])

        model12 = KMeans(n_clusters = 7, random_state = 0)
        model12.fit(test[col1])
        test['cluster'] = model12.labels_

        x2 = test[col2]

        pred_x2 = model2.predict(x2) 

        dictionary = {'sight_x': pred_x1.tolist(),'sight_y': pred_x2.tolist()}
        df = pd.DataFrame(dictionary)

        import pandas as pd

        new_df_index = []
        for i in range(1,11):
            alpha_x = str(i) + '_sight_x'
            alpha_y = str(i) + '_sight_y'
            new_df_index.append(alpha_x)
            new_df_index.append(alpha_y)

        array = df.values.tolist()

        i = 0
        new_array = []
        small_unit =[]
        for unit in array:
            a = unit[0]
            b = unit[1]
            small_unit.append(a)
            small_unit.append(b)
            if i % 10 == 9:
                new_array.append(small_unit)
                small_unit = []
            i += 1

        new_df = pd.DataFrame(new_array, columns= new_df_index)

        return new_df

    def calculate_eye_opening(eye_points, facial_landmarks):
        top_points = eye_points[:3]  # 上部の点
        bottom_points = eye_points[3:6]  # 下部の点

        top_mean = np.mean([(facial_landmarks.part(point).x, facial_landmarks.part(point).y) for point in top_points], axis=0)
        bottom_mean = np.mean([(facial_landmarks.part(point).x, facial_landmarks.part(point).y) for point in bottom_points], axis=0)

        eye_opening = np.linalg.norm(top_mean - bottom_mean)
        return eye_opening

    def process_video(cap, blink_threshold, new_df):
        frame_count = 0
        blink_count = 0
        previous_eye_status = 'open'

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % 1 == 0:  # 5フレームごとに処理
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = detector(gray)

                for face in faces:
                    landmarks = predictor(gray, face)

                    left_eye_opening = calculate_eye_opening([36, 37, 38, 39, 40, 41], landmarks)
                    right_eye_opening = calculate_eye_opening([42, 43, 44, 45, 46, 47], landmarks)

                    # 瞼が閉じているかどうかを判断
                    current_eye_status = 'closed' if left_eye_opening < blink_threshold else 'open'

                    # 前のフレームで目が開いており、現在のフレームで閉じている場合にカウント
                    if previous_eye_status == 'open' and current_eye_status == 'closed':
                        blink_count += 1

                    previous_eye_status = current_eye_status

        cap.release()
        #print(f"Blink Count: {blink_count}")

        #データフレームに新しい列としてblink_countの値を追加
        new_df['11_mabataki'] = blink_count

    import pandas as pd
    import matplotlib.pyplot as plt
    from sklearn.model_selection import train_test_split

    def detect_cheating(df):

        def count_consecutive_values(df, column):
            df['Consecutive_Count_x'] = df[column].groupby((df[column] != df[column].shift()).cumsum()).cumcount() + 1
            return df

        def count_consecutive_values1(df, column):
            df['Consecutive_Count_y'] = df[column].groupby((df[column] != df[column].shift()).cumsum()).cumcount() + 1
            return df

        print(df.columns)
        for i in range(2,11):
            df['delta_' + str(i) + '_sight_x'] = df[str(i) + '_sight_x'] - df[str(i - 1) + '_sight_x']

        for i in range(2,11):
            df['delta_' + str(i) + '_sight_y'] = df[str(i) + '_sight_y'] - df[str(i - 1) + '_sight_y']

        for i in range(1,11):
            df = df.drop([str(i) + '_sight_x'],axis =1)
            df = df.drop([str(i) + '_sight_y'],axis = 1)

        columns_to_select_x = [f'delta_{i}_sight_x' for i in range(2, 11)]
        columns_to_select_y = [f'delta_{i}_sight_y' for i in range(2, 11)]
        for j in range(len(df)):
            new = df.iloc[[j]][columns_to_select_x]
            new =new.T
            new = count_consecutive_values(new, j)
            max = new['Consecutive_Count_x'].max()
            df.loc[j, 'Consecutive_Count_x'] = max

        for j in range(len(df)):
            new = df.iloc[[j]][columns_to_select_y]
            new =new.T
            new = count_consecutive_values1(new, j)
            max = new['Consecutive_Count_y'].max()
            df.loc[j, 'Consecutive_Count_y'] = max

        import lightgbm as lgb
        from sklearn.model_selection import KFold
        from sklearn.model_selection import cross_val_score

        import pickle
        model_path = "static/src/pkl/model_detect.pkl"
  
        with open(model_path, 'rb') as file:
            model = pickle.load(file)

        x_df = df[['11_mabataki', 'delta_2_sight_x', 'delta_3_sight_x','delta_4_sight_x', 'delta_5_sight_x', 'delta_6_sight_x','delta_7_sight_x', 'delta_8_sight_x', 'delta_9_sight_x','delta_10_sight_x', 'delta_2_sight_y', 'delta_3_sight_y','delta_4_sight_y', 'delta_5_sight_y', 'delta_6_sight_y','delta_7_sight_y', 'delta_8_sight_y', 'delta_9_sight_y','delta_10_sight_y', 'Consecutive_Count_x', 'Consecutive_Count_y']]

        y_pred = model.predict(x_df)
        for i in y_pred.tolist():
            return i

    def check_dataframe_rows(df):
        row_count = len(df)

        result = 1 if row_count >= 10 else 0

        return (result,row_count)

    def remove_dataframe(df, number):
        for i in range(number):
            df = df.drop(i,axis=0)
        return df

    def check_and_process(df, cap):
        result_check,rows = check_dataframe_rows(df)

        if result_check == 0:
            return -1
        else:
            if rows > 10:
                number = rows - 10
                df = remove_dataframe(df, number)
                
            new_df = process_dataframe(df)
            blink_threshold = 10.4  
            process_video(cap, blink_threshold, new_df)
            jud = detect_cheating(new_df)
            return jud

    result = check_and_process(df, cap)

    return result