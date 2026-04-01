'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const t = useTranslations('reports');
  const locale = useLocale();

  const reports = [
    { id: 1, title: locale === 'zh' ? '月度患者统计报告' : 'Monthly Patient Statistics', date: '2024-03-01', type: locale === 'zh' ? '统计' : 'Statistics', size: '2.5 MB' },
    { id: 2, title: locale === 'zh' ? '用药依从性分析' : 'Medication Adherence Analysis', date: '2024-03-15', type: locale === 'zh' ? '分析' : 'Analysis', size: '1.8 MB' },
    { id: 3, title: locale === 'zh' ? '季度健康趋势报告' : 'Quarterly Health Trends', date: '2024-03-31', type: locale === 'zh' ? '趋势' : 'Trends', size: '4.2 MB' },
    { id: 4, title: locale === 'zh' ? '医生工作量统计' : 'Doctor Workload Report', date: '2024-03-31', type: locale === 'zh' ? '统计' : 'Statistics', size: '1.2 MB' },
  ];

  const statLabels = [
    locale === 'zh' ? '本月报告' : 'Reports This Month',
    locale === 'zh' ? '数据导出' : 'Data Exports',
    locale === 'zh' ? '趋势分析' : 'Trend Analyses',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <p className="text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: statLabels[0], value: '12', icon: FileText, color: 'blue' },
          { label: statLabels[1], value: '48', icon: Download, color: 'green' },
          { label: statLabels[2], value: '6', icon: TrendingUp, color: 'purple' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 flex items-center space-x-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-500/20 text-blue-500' :
                stat.color === 'green' ? 'bg-green-500/20 text-green-500' :
                'bg-purple-500/20 text-purple-500'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-[var(--border-glass)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {locale === 'zh' ? '最近报告' : 'Recent Reports'}
          </h2>
        </div>
        <div className="divide-y divide-[var(--border-glass)]">
          {reports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{report.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)] mt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{report.date}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-xs">
                      {report.type}
                    </span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-white/10 text-[var(--color-primary)] transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
