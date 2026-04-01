'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, QrCode, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

interface WeChatBindingData {
  openId: string;
  patientName: string;
  boundAt: string;
}

interface Props {
  patientId: string;
  patientName: string;
}

export default function WeChatBinding({ patientId, patientName }: Props) {
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [bindings, setBindings] = useState<WeChatBindingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchBindings();
    }
  }, [isOpen, token]);

  const fetchBindings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/wechat/bindings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBindings(data.data.filter((b: any) => b.patientId === patientId));
      }
    } catch (error) {
      console.error('Failed to fetch bindings:', error);
    }
  };

  const generateQRCode = () => {
    // In production, this would generate a real WeChat QR code
    setShowQR(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>微信绑定</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  微信绑定 - {patientName}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[var(--bg-secondary)]">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    已绑定的微信号
                  </h3>
                  {bindings.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">
                      暂无绑定的微信号
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bindings.map((binding, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-[var(--text-primary)]">
                            {binding.patientName}
                          </span>
                          <span className="text-[var(--text-muted)]">
                            ({new Date(binding.boundAt).toLocaleDateString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <button
                    onClick={generateQRCode}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>生成绑定二维码</span>
                  </button>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    患者或家属扫描二维码即可绑定微信
                  </p>
                </div>

                {showQR && (
                  <div className="p-4 rounded-lg bg-white text-center">
                    <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center text-gray-400">
                      {/* In production, this would be a real QR code */}
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2" />
                        <p className="text-xs">模拟二维码</p>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      请使用微信扫一扫
                    </p>
                  </div>
                )}

                <div className="text-sm text-[var(--text-muted)]">
                  <p className="font-medium mb-1">绑定后可使用功能：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>接收用药提醒</li>
                    <li>查看预约信息</li>
                    <li>上报症状</li>
                    <li>接收健康报告</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
