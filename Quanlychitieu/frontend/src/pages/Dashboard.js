import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import axiosClient from '../api/axiosClient';
import { formatCurrency } from '../utils/formatCurrency';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('current_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const getArrayData = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        axiosClient.get('/expenses'),
        axiosClient.get('/incomes'),
        axiosClient.get('/budgets'),
      ]);

      const [expenseResult, incomeResult, budgetResult] = results;

      if (expenseResult.status === 'fulfilled') {
        setExpenses(getArrayData(expenseResult.value));
      }

      if (incomeResult.status === 'fulfilled') {
        setIncomes(getArrayData(incomeResult.value));
      }

      if (budgetResult.status === 'fulfilled') {
        setBudgets(getArrayData(budgetResult.value));
      }

      const allFailed = results.every(
        (result) => result.status === 'rejected',
      );

      if (allFailed) {
        setError(
          'Không thể tải dữ liệu. Hãy kiểm tra backend và quyền truy cập API.',
        );
      }
    } catch {
      setError('Có lỗi xảy ra khi tải Dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalIncome = useMemo(() => {
    return incomes.reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );
  }, [incomes]);

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (total, item) => total + Number(item.amount || 0),
      0,
    );
  }, [expenses]);

  const balance = totalIncome - totalExpense;

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (total, item) =>
        total +
        Number(
          item.amount ??
            item.limitAmount ??
            item.budgetAmount ??
            0,
        ),
      0,
    );
  }, [budgets]);

  const getItemDate = (item) => {
    return (
      item.expenseDate ||
      item.incomeDate ||
      item.date ||
      item.createdAt ||
      null
    );
  };

  const recentTransactions = useMemo(() => {
    const normalizedExpenses = expenses.map((item) => ({
      ...item,
      transactionType: 'expense',
      displayName:
        item.description ||
        item.name ||
        item.title ||
        'Khoản chi',
      transactionDate: getItemDate(item),
    }));

    const normalizedIncomes = incomes.map((item) => ({
      ...item,
      transactionType: 'income',
      displayName:
        item.description ||
        item.name ||
        item.title ||
        item.source ||
        'Khoản thu',
      transactionDate: getItemDate(item),
    }));

    return [...normalizedExpenses, ...normalizedIncomes]
      .sort((a, b) => {
        const dateA = a.transactionDate
          ? new Date(a.transactionDate).getTime()
          : 0;

        const dateB = b.transactionDate
          ? new Date(b.transactionDate).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [expenses, incomes]);

  const getMonthValue = (items, monthIndex) => {
    const currentYear = new Date().getFullYear();

    return items
      .filter((item) => {
        const itemDate = getItemDate(item);

        if (!itemDate) {
          return false;
        }

        const date = new Date(itemDate);

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === monthIndex
        );
      })
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0,
      );
  };

  const monthlyChartData = useMemo(() => {
    const months = [
      'T1',
      'T2',
      'T3',
      'T4',
      'T5',
      'T6',
      'T7',
      'T8',
      'T9',
      'T10',
      'T11',
      'T12',
    ];

    return {
      labels: months,
      datasets: [
        {
          label: 'Thu nhập',
          data: months.map((_, index) =>
            getMonthValue(incomes, index),
          ),
          backgroundColor: 'rgba(25, 135, 84, 0.75)',
          borderRadius: 6,
        },
        {
          label: 'Chi tiêu',
          data: months.map((_, index) =>
            getMonthValue(expenses, index),
          ),
          backgroundColor: 'rgba(220, 53, 69, 0.75)',
          borderRadius: 6,
        },
      ],
    };
  }, [expenses, incomes]);

  const doughnutData = {
    labels: ['Thu nhập', 'Chi tiêu'],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: [
          'rgba(25, 135, 84, 0.82)',
          'rgba(220, 53, 69, 0.82)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Chưa có ngày';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div
          className="spinner-border text-primary"
          role="status"
        />
        <p>Đang tải dữ liệu Dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2>
            Xin chào,{' '}
            {currentUser.username || 'Người dùng'}
          </h2>

          <p>
            Tổng quan tình hình tài chính cá nhân của bạn.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchDashboardData}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="alert alert-warning">{error}</div>
      )}

      <div className="row g-4">
        <div className="col-xl-3 col-md-6">
          <div className="stat-card stat-income">
            <div className="stat-icon">
              <i className="bi bi-arrow-up-right" />
            </div>

            <div>
              <p>Tổng thu nhập</p>
              <h3>{formatCurrency(totalIncome)}</h3>
              <span>{incomes.length} khoản thu</span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="stat-card stat-expense">
            <div className="stat-icon">
              <i className="bi bi-arrow-down-right" />
            </div>

            <div>
              <p>Tổng chi tiêu</p>
              <h3>{formatCurrency(totalExpense)}</h3>
              <span>{expenses.length} khoản chi</span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="stat-card stat-balance">
            <div className="stat-icon">
              <i className="bi bi-wallet2" />
            </div>

            <div>
              <p>Số dư hiện tại</p>
              <h3>{formatCurrency(balance)}</h3>
              <span>
                {balance >= 0
                  ? 'Tài chính đang dương'
                  : 'Chi tiêu vượt thu nhập'}
              </span>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="stat-card stat-budget">
            <div className="stat-icon">
              <i className="bi bi-pie-chart" />
            </div>

            <div>
              <p>Tổng ngân sách</p>
              <h3>{formatCurrency(totalBudget)}</h3>
              <span>{budgets.length} ngân sách</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-xl-8">
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h5>Thu nhập và chi tiêu</h5>
                <p>Thống kê theo từng tháng trong năm</p>
              </div>
            </div>

            <div className="chart-large">
              <Bar
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback(value) {
                          return new Intl.NumberFormat(
                            'vi-VN',
                            {
                              notation: 'compact',
                            },
                          ).format(value);
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h5>Cơ cấu tài chính</h5>
                <p>Tỷ lệ tổng thu và tổng chi</p>
              </div>
            </div>

            <div className="chart-doughnut">
              {totalIncome === 0 && totalExpense === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-pie-chart" />
                  <p>Chưa có dữ liệu để hiển thị</p>
                </div>
              ) : (
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-panel mt-4">
        <div className="panel-heading">
          <div>
            <h5>Giao dịch gần đây</h5>
            <p>Các khoản thu và chi mới nhất</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table transaction-table align-middle">
            <thead>
              <tr>
                <th>Nội dung</th>
                <th>Loại giao dịch</th>
                <th>Ngày</th>
                <th className="text-end">Số tiền</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-table">
                      <i className="bi bi-receipt" />
                      <p>Chưa có giao dịch nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map(
                  (transaction, index) => (
                    <tr
                      key={`${transaction.transactionType}-${transaction.id || index}`}
                    >
                      <td>
                        <div className="transaction-name">
                          <div
                            className={
                              transaction.transactionType ===
                              'income'
                                ? 'transaction-symbol income-symbol'
                                : 'transaction-symbol expense-symbol'
                            }
                          >
                            <i
                              className={
                                transaction.transactionType ===
                                'income'
                                  ? 'bi bi-arrow-up-right'
                                  : 'bi bi-arrow-down-right'
                              }
                            />
                          </div>

                          <div>
                            <strong>
                              {transaction.displayName}
                            </strong>
                            <small>
                              {transaction.category?.name ||
                                transaction.category ||
                                'Không có danh mục'}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            transaction.transactionType ===
                            'income'
                              ? 'badge text-bg-success'
                              : 'badge text-bg-danger'
                          }
                        >
                          {transaction.transactionType ===
                          'income'
                            ? 'Thu nhập'
                            : 'Chi tiêu'}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          transaction.transactionDate,
                        )}
                      </td>

                      <td
                        className={
                          transaction.transactionType ===
                          'income'
                            ? 'text-end transaction-amount income-amount'
                            : 'text-end transaction-amount expense-amount'
                        }
                      >
                        {transaction.transactionType ===
                        'income'
                          ? '+'
                          : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;