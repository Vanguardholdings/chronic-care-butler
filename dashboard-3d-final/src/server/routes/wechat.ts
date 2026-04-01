import { Router, Request, Response } from 'express';
import { wechatService } from '../services/wechat';
import WeChatBinding from '../models/WeChatBinding';
import Patient from '../models/Patient';
import Medication from '../models/Medication';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/wechat/webhook
 * WeChat server verification endpoint
 */
router.get('/webhook', (req: Request, res: Response) => {
  const { signature, timestamp, nonce, echostr } = req.query;

  if (!signature || !timestamp || !nonce) {
    return res.status(400).send('Missing parameters');
  }

  const isValid = wechatService.validateSignature(
    signature as string,
    timestamp as string,
    nonce as string
  );

  if (isValid) {
    // Return echostr for verification
    res.send(echostr);
  } else {
    res.status(403).send('Invalid signature');
  }
});

/**
 * POST /api/wechat/webhook
 * Receive WeChat messages
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { signature, timestamp, nonce } = req.query;

    // Validate signature
    const isValid = wechatService.validateSignature(
      signature as string,
      timestamp as string,
      nonce as string
    );

    if (!isValid) {
      return res.status(403).send('Invalid signature');
    }

    // Parse XML message
    const xmlData = req.body;
    const message = wechatService.parseMessage(xmlData);

    console.log('Received WeChat message:', message);

    let response = '';

    // Handle different message types
    switch (message.MsgType) {
      case 'event':
        response = await handleEvent(message);
        break;
      case 'text':
        response = await handleTextMessage(message);
        break;
      default:
        response = wechatService.generateResponse(
          message.FromUserName,
          message.ToUserName,
          '您好，感谢您的留言。我们会尽快回复您。'
        );
    }

    res.set('Content-Type', 'application/xml');
    res.send(response);
  } catch (error) {
    console.error('WeChat webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * Handle WeChat events (subscribe, unsubscribe, click, etc.)
 */
async function handleEvent(message: any): Promise<string> {
  const { FromUserName, ToUserName, Event, EventKey } = message;

  switch (Event) {
    case 'subscribe':
      // User subscribed
      return wechatService.generateResponse(
        FromUserName,
        ToUserName,
        '欢迎使用慢病管家！\n\n请回复以下指令：\n\n【绑定】绑定患者档案\n【服药】记录服药情况\n【症状】上报症状\n【预约】查看预约\n【帮助】查看帮助'
      );

    case 'unsubscribe':
      // Remove binding on unsubscribe
      await WeChatBinding.deleteOne({ openId: FromUserName });
      return 'success';

    case 'CLICK':
      // Handle menu clicks
      return handleMenuClick(FromUserName, ToUserName, EventKey);

    default:
      return wechatService.generateResponse(
        FromUserName,
        ToUserName,
        '收到您的事件'
      );
  }
}

/**
 * Handle menu clicks
 */
async function handleMenuClick(openId: string, toUser: string, eventKey: string): Promise<string> {
  switch (eventKey) {
    case 'BIND_PATIENT':
      return wechatService.generateResponse(
        openId,
        toUser,
        '请回复【绑定 患者姓名】进行档案绑定。\n例如：绑定 张三'
      );

    case 'MEDICATION_RECORD':
      return wechatService.generateResponse(
        openId,
        toUser,
        '请回复【服药 药物名称】记录服药情况。\n例如：服药 二甲双胍'
      );

    case 'SYMPTOM_REPORT':
      return wechatService.generateResponse(
        openId,
        toUser,
        '请回复【症状 具体症状】上报症状。\n例如：症状 头晕、恶心'
      );

    case 'VIEW_APPOINTMENTS':
      return await handleViewAppointments(openId, toUser);

    case 'HELP':
      return wechatService.generateResponse(
        openId,
        toUser,
        '【慢病管家使用指南】\n\n📋 绑定档案：绑定 患者姓名\n💊 记录服药：服药 药物名称\n🏥 上报症状：症状 具体症状\n📅 查看预约：发送"预约"\n\n如有疑问请联系医护人员。'
      );

    default:
      return wechatService.generateResponse(openId, toUser, '收到您的点击');
  }
}

/**
 * Handle text messages
 */
async function handleTextMessage(message: any): Promise<string> {
  const { FromUserName, ToUserName, Content } = message;
  const content = Content?.trim() || '';

  // Parse commands
  if (content.startsWith('绑定')) {
    return await handleBindPatient(FromUserName, ToUserName, content);
  }

  if (content.startsWith('服药') || content.startsWith('吃药')) {
    return await handleMedicationRecord(FromUserName, ToUserName, content);
  }

  if (content.startsWith('症状')) {
    return await handleSymptomReport(FromUserName, ToUserName, content);
  }

  if (content.includes('预约')) {
    return await handleViewAppointments(FromUserName, ToUserName);
  }

  if (content.includes('帮助') || content.includes('?')) {
    return wechatService.generateResponse(
      FromUserName,
      ToUserName,
      '【慢病管家使用指南】\n\n📋 绑定档案：绑定 患者姓名\n💊 记录服药：服药 药物名称\n🏥 上报症状：症状 具体症状\n📅 查看预约：发送"预约"\n\n如有疑问请联系医护人员。'
    );
  }

  // Default response
  return wechatService.generateResponse(
    FromUserName,
    ToUserName,
    '收到您的消息。请回复【帮助】查看可用指令。'
  );
}

/**
 * Handle patient binding
 */
async function handleBindPatient(openId: string, toUser: string, content: string): Promise<string> {
  const parts = content.split(' ');
  if (parts.length < 2) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '格式错误。请回复：绑定 患者姓名\n例如：绑定 张三'
    );
  }

  const patientName = parts[1].trim();

  // Find patient
  const patient = await Patient.findOne({ name: { $regex: patientName, $options: 'i' } });

  if (!patient) {
    return wechatService.generateResponse(
      openId,
      toUser,
      `未找到患者"${patientName}"，请确认姓名是否正确。`
    );
  }

  // Create or update binding
  await WeChatBinding.findOneAndUpdate(
    { openId },
    {
      openId,
      patientId: patient._id,
      patientName: patient.name,
      boundAt: new Date(),
    },
    { upsert: true }
  );

  return wechatService.generateResponse(
    openId,
    toUser,
    `✅ 绑定成功！\n\n患者：${patient.name}\n病情：${patient.condition}\n房间：${patient.room}\n\n您现在可以：\n💊 回复"服药 药物名"记录服药\n🏥 回复"症状 症状描述"上报症状\n📅 发送"预约"查看预约`
  );
}

/**
 * Handle medication adherence recording
 */
async function handleMedicationRecord(openId: string, toUser: string, content: string): Promise<string> {
  // Check if user is bound
  const binding = await WeChatBinding.findOne({ openId });

  if (!binding) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '您尚未绑定患者档案。请先回复【绑定 患者姓名】进行绑定。'
    );
  }

  const parts = content.split(' ');
  const medicationName = parts.length > 1 ? parts[1].trim() : null;

  // Update medication adherence
  if (medicationName) {
    const medication = await Medication.findOne({
      patientId: binding.patientId,
      name: { $regex: medicationName, $options: 'i' },
      isActive: true,
    });

    if (medication) {
      // Add adherence record
      medication.adherence.push({
        date: new Date(),
        taken: true,
        notes: 'Recorded via WeChat',
      });
      await medication.save();

      return wechatService.generateResponse(
        openId,
        toUser,
        `✅ 服药记录已保存！\n\n药物：${medication.name}\n剂量：${medication.dosage}\n时间：${new Date().toLocaleString()}\n\n请继续按时服药，祝您早日康复！`
      );
    } else {
      return wechatService.generateResponse(
        openId,
        toUser,
        `未找到药物"${medicationName}"。请确认药物名称或联系医护人员。`
      );
    }
  }

  return wechatService.generateResponse(
    openId,
    toUser,
    '请回复：服药 药物名称\n例如：服药 二甲双胍'
  );
}

/**
 * Handle symptom reporting
 */
async function handleSymptomReport(openId: string, toUser: string, content: string): Promise<string> {
  // Check if user is bound
  const binding = await WeChatBinding.findOne({ openId });

  if (!binding) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '您尚未绑定患者档案。请先回复【绑定 患者姓名】进行绑定。'
    );
  }

  const parts = content.split(' ');
  if (parts.length < 2) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '请回复：症状 具体症状描述\n例如：症状 头晕、恶心、血压偏高'
    );
  }

  const symptoms = parts.slice(1).join(' ');

  // Create alert for symptom
  const Alert = (await import('../models/Alert')).default;
  await Alert.create({
    patientId: binding.patientId,
    type: 'symptom',
    priority: 'medium',
    message: `患者家属通过微信上报症状：${symptoms}`,
    acknowledged: false,
  });

  return wechatService.generateResponse(
    openId,
    toUser,
    `✅ 症状已上报！\n\n症状：${symptoms}\n时间：${new Date().toLocaleString()}\n\n医护人员会尽快查看，如有紧急情况请立即拨打急救电话。`
  );
}

/**
 * Handle view appointments
 */
async function handleViewAppointments(openId: string, toUser: string): Promise<string> {
  // Check if user is bound
  const binding = await WeChatBinding.findOne({ openId });

  if (!binding) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '您尚未绑定患者档案。请先回复【绑定 患者姓名】进行绑定。'
    );
  }

  // Get upcoming appointments
  const Appointment = (await import('../models/Appointment')).default;
  const appointments = await Appointment.find({
    patientId: binding.patientId,
    dateTime: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] },
  })
    .sort({ dateTime: 1 })
    .limit(3)
    .lean();

  if (appointments.length === 0) {
    return wechatService.generateResponse(
      openId,
      toUser,
      '暂无 upcoming预约。如有需要请联系医护人员安排。'
    );
  }

  let message = '【近期预约】\n\n';
  appointments.forEach((apt, index) => {
    const date = new Date(apt.dateTime).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    message += `${index + 1}. ${date}\n`;
    message += `   类型：${apt.type}\n`;
    message += `   医生：${apt.doctor}\n`;
    message += `   地点：${apt.location || '待确认'}\n\n`;
  });

  return wechatService.generateResponse(openId, toUser, message.trim());
}

/**
 * POST /api/wechat/bind
 * Bind patient from dashboard (requires auth)
 */
router.post('/bind', authenticate, async (req: any, res: Response) => {
  try {
    const { patientId, openId } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const binding = await WeChatBinding.findOneAndUpdate(
      { openId },
      {
        openId,
        patientId: patient._id,
        patientName: patient.name,
        boundBy: req.user?.id,
        boundAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: binding });
  } catch (error) {
    console.error('Bind error:', error);
    res.status(500).json({ success: false, message: 'Failed to bind patient' });
  }
});

/**
 * GET /api/wechat/bindings
 * Get all WeChat bindings (requires admin/doctor)
 */
router.get('/bindings', authenticate, async (req: any, res: Response) => {
  try {
    const bindings = await WeChatBinding.find()
      .populate('patientId', 'name room condition')
      .sort({ boundAt: -1 })
      .lean();

    res.json({ success: true, data: bindings });
  } catch (error) {
    console.error('Get bindings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bindings' });
  }
});

export default router;
