import cv2
import numpy as np
import random
import time

# 機械学習モデルのデモ関数
def demo_detect(input_cap):
    # 引数のVideoCaptureオブジェクトを変数capに格納
    cap = input_cap

    # 20秒待機
    time.sleep(20)

    # -1, 0, 1 のうち１つをランダムに返す
    return random.choice([-1, 0, 1])

# VideoCaptureオブジェクトを引数にとり、動画のフレームを返す関数
# （目的）VideoCaptureオブジェクトが正しく取れているか確認するため
def get_frame(input_cap):
    # 引数のVideoCaptureオブジェクトを変数capに格納
    cap = input_cap

    if not cap.isOpened():
        print("Error: VideoCaptureオブジェクトが開かれていません。")
        return None
    
    ret, frame = cap.read()  # フレームを取得
    # frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))    # フレーム数の取得

    if not ret:
        print("Error: フレームの取得に失敗しました。")
        return None
    
    # フレームレートを取得
    frame_rate = int(cap.get(cv2.CAP_PROP_FPS))
    
    # ビデオファイルの長さ（秒）を取得
    video_length = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / frame_rate
    
    return frame_rate