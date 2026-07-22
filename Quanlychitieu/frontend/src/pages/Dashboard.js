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
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getArrayData = (response) => {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    return [];
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [
        expensesResponse,
        incomesResponse,
        budgetsResponse,
        categoriesResponse,
      ] = await Promise.all([
        axiosClient.get('/expenses'),
        axiosClient.get('/incomes'),
        axiosClient.get('/budgets'),
        axiosClient.get('/categories'),
      ]);

      setExpenses(getArrayData(expensesResponse));
      setIncomes(getArrayData(incomesResponse));
      setBudgets(getArrayData(budgetsResponse));
      setCategories(getArrayData(categoriesResponse));
    } catch (err) {
      console.error('Lỗi tải Dashboard:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể tải dữ liệu Dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    const dateString = String(value).slice(0, 10);
    const [year, month, day] = dateString.split('-');

    return `${day}/${month}/${year}`;
  };

  const totalIncome = useMemo(() => {
    return incomes.reduce(
      (total, income) => total + Number(income.amount || 0),
      0,
    );
  }, [incomes]);

  const totalExpense = useMemo(() => {
    return expenses.reduce(
      (total, expense) => total + Number(expense.amount || 0),
      0,
    );
  }, [expenses]);

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (total, budget) => total + Number(budget.amount || 0),
      0,
    );
  }, [budgets]);

  const balance = totalIncome - totalExpense;

  const budgetUsedPercent =
    totalBudget > 0
      ? Math.round((totalExpense / totalBudget) * 100)
      : 0;

  const getCategoryName = useCallback(
  (item) => {
    if (item.category?.name) {
      return item.category.name;
    }

    const category = categories.find(
      (categoryItem) =>
        Number(categoryItem.id) === Number(item.categoryId),
    );

    return category?.name || 'Chưa phân loại';
  },
  [categories],
);

  const expenseByCategory = useMemo(() => {
    const result = {};

    expenses.forEach((expense) => {
      const categoryName = getCategoryName(expense);

      result[categoryName] =
        (result[categoryName] || 0) +
        Number(expense.amount || 0);
    });

    return result;
  }, [expenses, getCategoryName]);

  const barChartData = {
    labels: ['Tổng thu', 'Tổng chi', 'Số dư', 'Ngân sách'],
    datasets: [
      {
        label: 'Số tiền',
        data: [
          totalIncome,
          totalExpense,
          Math.max(balance, 0),
          totalBudget,
        ],
        backgroundColor: [
          'rgba(25, 135, 84, 0.75)',
          'rgba(220, 53, 69, 0.75)',
          'rgba(13, 110, 253, 0.75)',
          'rgba(255, 193, 7, 0.75)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => formatCurrency(context.raw),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            Number(value).toLocaleString('vi-VN'),
        },
      },
    },
  };

  const doughnutChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        label: 'Chi tiêu',
        data: Object.values(expenseByCategory),
        backgroundColor: [
          '#0d6efd',
          '#dc3545',
          '#198754',
          '#ffc107',
          '#6f42c1',
          '#0dcaf0',
          '#fd7e14',
          '#6c757d',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${formatCurrency(
              context.raw,
            )}`;
          },
        },
      },
    },
  };

  const recentTransactions = useMemo(() => {
    const incomeTransactions = incomes.map((income) => ({
      id: `income-${income.id}`,
      originalId: income.id,
      description: income.description || 'Khoản thu',
      amount: Number(income.amount || 0),
      date: income.incomeDate,
      categoryName: getCategoryName(income),
      type: 'income',
    }));

    const expenseTransactions = expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      originalId: expense.id,
      description: expense.description || 'Khoản chi',
      amount: Number(expense.amount || 0),
      date: expense.expenseDate,
      categoryName: getCategoryName(expense),
      type: 'expense',
    }));

    return [...incomeTransactions, ...expenseTransactions]
      .sort((firstItem, secondItem) => {
        return new Date(secondItem.date) - new Date(firstItem.date);
      })
      .slice(0, 8);
  }, [incomes, expenses, getCategoryName]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>

        <p className="text-muted mt-3">
          Đang tải dữ liệu tổng quan...
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Tổng quan tài chính</h2>

          <p className="text-muted mb-0">
            Theo dõi thu nhập, chi tiêu và ngân sách của bạn.
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
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="row g-4 mb-4">
        <SummaryCard
          title="Tổng thu nhập"
          value={formatCurrency(totalIncome)}
          icon="bi-wallet2"
          color="success"
          description={`${incomes.length} khoản thu`}
        />

        <SummaryCard
          title="Tổng chi tiêu"
          value={formatCurrency(totalExpense)}
          icon="bi-credit-card"
          color="danger"
          description={`${expenses.length} khoản chi`}
        />

        <SummaryCard
          title="Số dư hiện tại"
          value={formatCurrency(balance)}
          icon="bi-cash-stack"
          color={balance >= 0 ? 'primary' : 'danger'}
          description={
            balance >= 0
              ? 'Tài chính đang dương'
              : 'Chi tiêu vượt thu nhập'
          }
        />

        <SummaryCard
          title="Tổng ngân sách"
          value={formatCurrency(totalBudget)}
          icon="bi-bullseye"
          color="warning"
          description={`${budgets.length} ngân sách`}
        />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h5 className="fw-bold mb-1">
                  So sánh tài chính
                </h5>

                <p className="text-muted small mb-0">
                  Tổng thu, tổng chi, số dư và ngân sách.
                </p>
              </div>

              <div style={{ height: 340 }}>
                <Bar
                  data={barChartData}
                  options={barChartOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-1">
                Tiến độ ngân sách
              </h5>

              <p className="text-muted small">
                Mức chi tiêu trên tổng hạn mức.
              </p>

              <div className="text-center py-4">
                <div
                  className={`display-5 fw-bold ${
                    budgetUsedPercent > 100
                      ? 'text-danger'
                      : budgetUsedPercent >= 80
                        ? 'text-warning'
                        : 'text-primary'
                  }`}
                >
                  {budgetUsedPercent}%
                </div>

                <p className="text-muted mb-0">
                  Đã sử dụng ngân sách
                </p>
              </div>

              <div
                className="progress mb-3"
                style={{ height: 14 }}
              >
                <div
                  className={`progress-bar ${
                    budgetUsedPercent > 100
                      ? 'bg-danger'
                      : budgetUsedPercent >= 80
                        ? 'bg-warning'
                        : 'bg-primary'
                  }`}
                  style={{
                    width: `${Math.min(
                      budgetUsedPercent,
                      100,
                    )}%`,
                  }}
                />
              </div>

              <div className="d-flex justify-content-between small">
                <span className="text-muted">Đã chi</span>
                <strong>{formatCurrency(totalExpense)}</strong>
              </div>

              <div className="d-flex justify-content-between small mt-2">
                <span className="text-muted">Ngân sách</span>
                <strong>{formatCurrency(totalBudget)}</strong>
              </div>

              {totalBudget === 0 && (
                <div className="alert alert-light border mt-4 mb-0">
                  Chưa có ngân sách được thiết lập.
                </div>
              )}

              {budgetUsedPercent > 100 && (
                <div className="alert alert-danger mt-4 mb-0">
                  <i className="bi bi-exclamation-triangle me-2" />
                  Bạn đã vượt ngân sách.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-1">
                Chi tiêu theo danh mục
              </h5>

              <p className="text-muted small">
                Phân bổ chi tiêu của bạn.
              </p>

              {Object.keys(expenseByCategory).length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-pie-chart display-4 text-muted" />
                  <p className="text-muted mt-3 mb-0">
                    Chưa có dữ liệu chi tiêu.
                  </p>
                </div>
              ) : (
                <div style={{ height: 360 }}>
                  <Doughnut
                    data={doughnutChartData}
                    options={doughnutChartOptions}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    Giao dịch gần đây
                  </h5>

                  <p className="text-muted small mb-0">
                    Các khoản thu và chi mới nhất.
                  </p>
                </div>

                <span className="badge text-bg-light border">
                  {recentTransactions.length} giao dịch
                </span>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-receipt display-4 text-muted" />
                  <p className="text-muted mt-3 mb-0">
                    Chưa có giao dịch nào.
                  </p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentTransactions.map((transaction) => (
                    <div
                      className="list-group-item px-0 py-3"
                      key={transaction.id}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                            transaction.type === 'income'
                              ? 'bg-success-subtle text-success'
                              : 'bg-danger-subtle text-danger'
                          }`}
                          style={{
                            width: 46,
                            height: 46,
                          }}
                        >
                          <i
                            className={`bi ${
                              transaction.type === 'income'
                                ? 'bi-arrow-down-left'
                                : 'bi-arrow-up-right'
                            } fs-5`}
                          />
                        </div>

                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-semibold text-truncate">
                            {transaction.description}
                          </div>

                          <div className="small text-muted">
                            {transaction.categoryName}
                            {' · '}
                            {formatDate(transaction.date)}
                          </div>
                        </div>

                        <div
                          className={`fw-bold text-nowrap ${
                            transaction.type === 'income'
                              ? 'text-success'
                              : 'text-danger'
                          }`}
                        >
                          {transaction.type === 'income'
                            ? '+'
                            : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  description,
}) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <p className="text-muted small mb-2">{title}</p>

              <h4 className="fw-bold mb-2">{value}</h4>

              <small className="text-muted">{description}</small>
            </div>

            <div
              className={`rounded-3 bg-${color}-subtle text-${color} d-flex align-items-center justify-content-center`}
              style={{
                width: 50,
                height: 50,
                flexShrink: 0,
              }}
            >
              <i className={`bi ${icon} fs-4`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;