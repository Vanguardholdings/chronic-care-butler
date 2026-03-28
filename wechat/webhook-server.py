#!/usr/bin/env python3
"""
WeChat Webhook Server
处理微信消息推送和回调
"""

from flask import Flask, request, jsonify
import hashlib
import xml.etree.ElementTree as ET
import json
from datetime import datetime

app = Flask(__name__)


@app.route('/wechat/webhook', methods=['GET', 'POST'])
def wechat_webhook():
    """微信消息推送处理"""
    if request.method == 'GET':
        # 服务器验证
        signature = request.args.get('signature')
        timestamp = request.args.get('timestamp')
        nonce = request.args.get('nonce')
        echostr = request.args.get('echostr')
        return echostr if echostr else 'success'

    if request.method == 'POST':
        # 处理消息
        xml_data = request.data
        root = ET.fromstring(xml_data)

        msg_type = root.find('MsgType').text
        from_user = root.find('FromUserName').text
        to_user = root.find('ToUserName').text

        print(f"Received {msg_type} from {from_user}")

        # 处理不同消息类型
        if msg_type == 'text':
            content = root.find('Content').text
            print(f"Content: {content}")

            # TODO: 路由到相应的技能处理

        return 'success'


@app.route('/wechat/menu', methods=['POST'])
def create_menu():
    """创建自定义菜单"""
    menu_data = {
        "button": [
            {
                "name": "用药提醒",
                "sub_button": [
                    {"type": "click", "name": "今日用药", "key": "TODAY_MEDS"},
                    {"type": "click", "name": "用药记录", "key": "MED_HISTORY"}
                ]
            },
            {
                "name": "我的健康",
                "sub_button": [
                    {"type": "click", "name": "预约记录", "key": "APPOINTMENTS"},
                    {"type": "click", "name": "健康数据", "key": "HEALTH_DATA"}
                ]
            },
            {"type": "click", "name": "联系护士", "key": "CONTACT_NURSE"}
        ]
    }
    return jsonify(menu_data)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
