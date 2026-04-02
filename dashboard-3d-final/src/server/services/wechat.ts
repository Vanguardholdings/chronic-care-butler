import crypto from 'crypto';
import axios from 'axios';

interface WeChatConfig {
  appId: string;
  appSecret: string;
  token: string;
  encodingAESKey?: string;
}

interface WeChatMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: number;
  MsgType: string;
  Content?: string;
  Event?: string;
  EventKey?: string;
}

interface WeChatUserInfo {
  subscribe: number;
  openid: string;
  nickname: string;
  sex: number;
  language: string;
  city: string;
  province: string;
  country: string;
  headimgurl: string;
  subscribe_time: number;
  remark: string;
  groupid: number;
  tagid_list: number[];
  subscribe_scene: string;
  qr_scene: number;
  qr_scene_str: string;
}

class WeChatService {
  private config: WeChatConfig;
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      token: process.env.WECHAT_TOKEN || '',
      encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY,
    };
  }

  /**
   * Validate WeChat server signature
   */
  validateSignature(signature: string, timestamp: string, nonce: string): boolean {
    const token = this.config.token;
    const arr = [token, timestamp, nonce].sort();
    const str = arr.join('');
    const hash = crypto.createHash('sha1').update(str).digest('hex');
    return hash === signature;
  }

  /**
   * Get WeChat access token
   */
  async getAccessToken(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.appId}&secret=${this.config.appSecret}`
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        // Token expires in 7200 seconds, refresh 5 minutes early
        this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
        return this.accessToken;
      }

      throw new Error('Failed to get access token');
    } catch (error) {
      console.error('Error getting WeChat access token:', error);
      throw error;
    }
  }

  /**
   * Get user info by OpenID
   */
  async getUserInfo(openId: string): Promise<WeChatUserInfo> {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${token}&openid=${openId}&lang=zh_CN`
    );

    if (response.data.errcode) {
      throw new Error(`WeChat API error: ${response.data.errmsg}`);
    }

    return response.data;
  }

  /**
   * Send template message to user
   */
  async sendTemplateMessage(
    openId: string,
    templateId: string,
    url: string,
    data: Record<string, { value: string; color?: string }>
  ): Promise<void> {
    const token = await this.getAccessToken();
    
    const message = {
      touser: openId,
      template_id: templateId,
      url,
      data,
    };

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
      message
    );

    if (response.data.errcode !== 0) {
      console.error('WeChat template message error:', response.data);
      throw new Error(`Failed to send template message: ${response.data.errmsg}`);
    }
  }

  /**
   * Send medication reminder
   */
  async sendMedicationReminder(
    openId: string,
    patientName: string,
    medicationName: string,
    dosage: string,
    time: string
  ): Promise<void> {
    const templateId = process.env.WECHAT_MEDICATION_TEMPLATE_ID || '';
    const url = `${process.env.FRONTEND_URL}/patient/medications`;

    await this.sendTemplateMessage(openId, templateId, url, {
      patient: { value: patientName, color: '#173177' },
      medication: { value: medicationName, color: '#173177' },
      dosage: { value: dosage, color: '#173177' },
      time: { value: time, color: '#173177' },
      remark: { value: '请按时服药，如有不适请及时联系医护人员。', color: '#666666' },
    });
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    openId: string,
    patientName: string,
    appointmentType: string,
    doctor: string,
    dateTime: string,
    location: string
  ): Promise<void> {
    const templateId = process.env.WECHAT_APPOINTMENT_TEMPLATE_ID || '';
    const url = `${process.env.FRONTEND_URL}/patient/appointments`;

    await this.sendTemplateMessage(openId, templateId, url, {
      patient: { value: patientName, color: '#173177' },
      type: { value: appointmentType, color: '#173177' },
      doctor: { value: doctor, color: '#173177' },
      time: { value: dateTime, color: '#173177' },
      location: { value: location, color: '#173177' },
      remark: { value: '请提前15分钟到达，如有变动请提前联系。', color: '#666666' },
    });
  }

  /**
   * Send vitals alert to family
   */
  async sendVitalsAlert(
    openId: string,
    patientName: string,
    alertType: string,
    value: string,
    time: string
  ): Promise<void> {
    const templateId = process.env.WECHAT_ALERT_TEMPLATE_ID || '';
    const url = `${process.env.FRONTEND_URL}/patient/vitals`;

    await this.sendTemplateMessage(openId, templateId, url, {
      patient: { value: patientName, color: '#173177' },
      alertType: { value: alertType, color: '#FF0000' },
      value: { value: value, color: '#FF0000' },
      time: { value: time, color: '#173177' },
      remark: { value: '患者生命体征出现异常，请关注。', color: '#FF0000' },
    });
  }

  /**
   * Parse incoming WeChat message
   */
  parseMessage(xmlData: string | any): WeChatMessage {
    const message: WeChatMessage = {
      ToUserName: '',
      FromUserName: '',
      CreateTime: 0,
      MsgType: '',
    };

    // Handle already-parsed object (from xml2js body parser)
    if (typeof xmlData === 'object' && xmlData.xml) {
      const xml = xmlData.xml;
      message.ToUserName = xml.tousername?.[0] || '';
      message.FromUserName = xml.fromusername?.[0] || '';
      message.CreateTime = parseInt(xml.createtime?.[0] || '0');
      message.MsgType = xml.msgtype?.[0] || '';
      message.Content = xml.content?.[0] || '';
      message.Event = xml.event?.[0] || '';
      message.EventKey = xml.eventkey?.[0] || '';
      return message;
    }

    // Handle raw XML string (fallback for backward compatibility)
    if (typeof xmlData === 'string') {
      const toUserMatch = xmlData.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/i);
      const fromUserMatch = xmlData.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/i);
      const createTimeMatch = xmlData.match(/<CreateTime>(\d+)<\/CreateTime>/);
      const msgTypeMatch = xmlData.match(/<MsgType><!\[CDATA\[(.*?)\]\]><\/MsgType>/i);
      const contentMatch = xmlData.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/i);
      const eventMatch = xmlData.match(/<Event><!\[CDATA\[(.*?)\]\]><\/Event>/i);
      const eventKeyMatch = xmlData.match(/<EventKey><!\[CDATA\[(.*?)\]\]><\/EventKey>/i);

      if (toUserMatch) message.ToUserName = toUserMatch[1];
      if (fromUserMatch) message.FromUserName = fromUserMatch[1];
      if (createTimeMatch) message.CreateTime = parseInt(createTimeMatch[1]);
      if (msgTypeMatch) message.MsgType = msgTypeMatch[1];
      if (contentMatch) message.Content = contentMatch[1];
      if (eventMatch) message.Event = eventMatch[1];
      if (eventKeyMatch) message.EventKey = eventKeyMatch[1];
    }

    return message;
  }

  /**
   * Generate response XML
   */
  generateResponse(toUser: string, fromUser: string, content: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `
      <xml>
        <ToUserName><![CDATA[${toUser}]]></ToUserName>
        <FromUserName><![CDATA[${fromUser}]]></FromUserName>
        <CreateTime>${timestamp}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${content}]]></Content>
      </xml>
    `.trim();
  }
}

export const wechatService = new WeChatService();
export default wechatService;
