
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import axiosClient from '../api/axiosClient';
import '../styles/management.css';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const money = (value) => Number(value || 0).toLocaleString('vi-VN', {
  style: 'currency', currency: 'VND',
});

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const extract = (response) =>
    Array.isArray(response.data) ? response.data : response.data?.data || [];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [e, i, b, c] = await Promise.all([
        axiosClient.get('/expenses'),
        axiosClient.get('/incomes'),
        axiosClient.get('/budgets'),
        axiosClient.get('/categories'),
      ]);
      setExpenses(extract(e));
      setIncomes(extract(i));
      setBudgets(extract(b));
      setCategories(extract(c));
    } catch (err) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Không thể tải dữ liệu tổng quan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [incomes],
  );
  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses],
  );
  const totalBudget = useMemo(
    () => budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [budgets],
  );
  const balance = totalIncome - totalExpense;
  const used = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

  const categoryName = useCallback((item) => {
    if (item.category?.name) return item.category.name;
    return categories.find((c) => Number(c.id) === Number(item.categoryId))?.name || 'Chưa phân loại';
  }, [categories]);

  const expenseByCategory = useMemo(() => {
    const result = {};
    expenses.forEach((item) => {
      const name = categoryName(item);
      result[name] = (result[name] || 0) + Number(item.amount || 0);
    });
    return result;
  }, [expenses, categoryName]);

  const recent = useMemo(() => [
    ...incomes.map((x) => ({ ...x, key: `i-${x.id}`, type: 'income', date: x.incomeDate })),
    ...expenses.map((x) => ({ ...x, key: `e-${x.id}`, type: 'expense', date: x.expenseDate })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7), [incomes, expenses]);

  const barData = {
    labels: ['Thu nhập', 'Chi tiêu', 'Số dư', 'Ngân sách'],
    datasets: [{
      data: [totalIncome, totalExpense, Math.max(balance, 0), totalBudget],
      backgroundColor: ['#10b981', '#f43f5e', '#4f46e5', '#06b6d4'],
      borderRadius: 10,
      maxBarThickness: 58,
    }],
  };

  const doughnutData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'],
      borderColor: '#fff',
      borderWidth: 3,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => money(ctx.raw) } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 600 } } },
      y: { beginAtZero: true, grid: { color: '#eef2f7' }, ticks: { color: '#94a3b8' } },
    },
  };

  if (loading) {
    return (
      <div className="em-loading">
        <div>
          <div className="spinner-border text-primary mb-3" />
          <div className="fw-semibold">Đang tổng hợp dữ liệu tài chính...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="em-page">
      <div className="em-page-header">
        <div>
          <p className="em-page-eyebrow">Financial overview</p>
          <h1 className="em-page-title">Tổng quan tài chính</h1>
          <p className="em-page-subtitle">Theo dõi dòng tiền, ngân sách và những giao dịch mới nhất.</p>
        </div>
        <button className="em-button em-button-primary" onClick={load}>
          <i className="bi bi-arrow-clockwise" /> Làm mới dữ liệu
        </button>
      </div>

      {error && (
        <div className="em-alert em-alert-danger">
          <i className="bi bi-exclamation-triangle-fill" /> {error}
        </div>
      )}

      <div className="em-stat-grid">
        {[
          ['Thu nhập', totalIncome, `${incomes.length} khoản thu`, 'bi-arrow-down-left', '#10b981', '#ecfdf5'],
          ['Chi tiêu', totalExpense, `${expenses.length} khoản chi`, 'bi-arrow-up-right', '#f43f5e', '#fff1f2'],
          ['Số dư hiện tại', balance, balance >= 0 ? 'Tài chính đang dương' : 'Chi vượt thu', 'bi-wallet2', '#4f46e5', '#eef2ff'],
          ['Ngân sách', totalBudget, `${budgets.length} hạn mức`, 'bi-bullseye', '#06b6d4', '#ecfeff'],
        ].map(([label, value, note, icon, color, soft]) => (
          <div className="em-stat" key={label} style={{ '--stat-color': color, '--stat-soft': soft }}>
            <div className="em-stat-top">
              <div>
                <p className="em-stat-label">{label}</p>
                <div className="em-stat-value">{money(value)}</div>
                <div className="em-stat-note">{note}</div>
              </div>
              <div className="em-stat-icon"><i className={`bi ${icon}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="em-dashboard-grid">
        <div className="em-card em-panel">
          <div className="em-panel-header">
            <div><h3>So sánh tài chính</h3><p>Thu nhập, chi tiêu, số dư và ngân sách</p></div>
          </div>
          <div style={{ height: 310 }}><Bar data={barData} options={chartOptions} /></div>
        </div>

        <div className="em-card em-panel">
          <div className="em-panel-header">
            <div><h3>Tiến độ ngân sách</h3><p>Mức chi tiêu trên tổng hạn mức</p></div>
            <span className="em-pill">{used}% đã dùng</span>
          </div>
          <div className="em-progress mb-3">
            <span style={{
              width: `${Math.min(used, 100)}%`,
              background: used > 100
                ? 'linear-gradient(90deg,#f43f5e,#e11d48)'
                : used >= 80
                  ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                  : 'linear-gradient(90deg,#4f46e5,#06b6d4)',
            }} />
          </div>
          <div className="d-flex justify-content-between small text-muted mb-4">
            <span>Đã chi <strong className="em-money-expense">{money(totalExpense)}</strong></span>
            <span>Hạn mức <strong>{money(totalBudget)}</strong></span>
          </div>
          {totalBudget === 0 && (
            <div className="em-empty" style={{ padding: '34px 10px' }}>
              <div className="em-empty-icon"><i className="bi bi-bullseye" /></div>
              <strong>Chưa thiết lập ngân sách</strong>
            </div>
          )}
        </div>
      </div>

      <div className="em-dashboard-grid">
        <div className="em-card em-panel">
          <div className="em-panel-header">
            <div><h3>Chi tiêu theo danh mục</h3><p>Tỷ trọng các nhóm chi tiêu</p></div>
          </div>
          {Object.keys(expenseByCategory).length ? (
            <div style={{ height: 300 }}>
              <Doughnut data={doughnutData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } },
              }} />
            </div>
          ) : (
            <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-pie-chart" /></div>Chưa có dữ liệu chi tiêu.</div>
          )}
        </div>

        <div className="em-card em-panel">
          <div className="em-panel-header">
            <div><h3>Giao dịch gần đây</h3><p>7 khoản thu và chi mới nhất</p></div>
            <span className="em-pill">{recent.length} giao dịch</span>
          </div>
          {recent.length ? (
            <div className="em-transaction-list">
              {recent.map((item) => (
                <div className="em-transaction" key={item.key}>
                  <div className={`em-transaction-icon ${item.type}`}>
                    <i className={`bi ${item.type === 'income' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small">{item.description || (item.type === 'income' ? 'Khoản thu' : 'Khoản chi')}</div>
                    <div className="text-muted" style={{ fontSize: 11.5 }}>
                      {categoryName(item)} · {item.date ? new Date(item.date).toLocaleDateString('vi-VN') : ''}
                    </div>
                  </div>
                  <div className={item.type === 'income' ? 'em-money-income' : 'em-money-expense'}>
                    {item.type === 'income' ? '+' : '-'}{money(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-receipt" /></div>Chưa có giao dịch nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
