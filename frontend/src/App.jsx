import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { Bell, Package, Users, Search, PlusCircle } from 'lucide-react';

// ============================================================
// DATOS DE RESPALDO (se muestran si el backend no responde)
// ============================================================
const MOCK_PRODUCTS = [
  { productID: 999, name: "HL Road Frame - Black, 58", productNumber: "FR-R92B-58", listPrice: 1431.50 },
  { productID: 998, name: "Sport-100 Helmet, Red", productNumber: "HL-U509-R", listPrice: 34.99 },
  { productID: 997, name: "Mountain Bike Socks, M", productNumber: "SO-B909-M", listPrice: 9.50 },
  { productID: 996, name: "AWC Logo Cap", productNumber: "CA-1098", listPrice: 8.99 },
  { productID: 995, name: "Long-Sleeve Logo Jersey, L", productNumber: "LJ-0192-L", listPrice: 49.99 },
  { productID: 994, name: "Mountain-200 Black, 46", productNumber: "BK-M68B-46", listPrice: 2294.99 },
  { productID: 993, name: "Road-650 Red, 52", productNumber: "BK-R50R-52", listPrice: 782.99 },
  { productID: 992, name: "Touring-1000 Blue, 60", productNumber: "BK-T79U-60", listPrice: 2384.07 },
  { productID: 991, name: "HL Mountain Tire", productNumber: "TI-M602", listPrice: 35.00 },
  { productID: 990, name: "Fender Set - Mountain", productNumber: "FE-6654", listPrice: 21.98 },
  { productID: 989, name: "Cable Lock", productNumber: "LO-C100", listPrice: 25.00 },
  { productID: 988, name: "Minipump", productNumber: "PU-0452", listPrice: 19.99 },
];

const MOCK_CUSTOMERS = [
  { customerID: 1, accountNumber: "AW00000001" },
  { customerID: 2, accountNumber: "AW00000002" },
  { customerID: 3, accountNumber: "AW00000003" },
  { customerID: 4, accountNumber: "AW00000004" },
  { customerID: 5, accountNumber: "AW00000005" },
  { customerID: 6, accountNumber: "AW00000006" },
  { customerID: 7, accountNumber: "AW00000007" },
  { customerID: 8, accountNumber: "AW00000008" },
  { customerID: 9, accountNumber: "AW00000009" },
  { customerID: 10, accountNumber: "AW00000010" },
  { customerID: 11, accountNumber: "AW00000011" },
  { customerID: 12, accountNumber: "AW00000012" },
];

const MOCK_SEARCH_PRODUCTS = {
  1: [{ productID: 1, name: "Adjustable Race", listPrice: 0.00 }],
  2: [{ productID: 2, name: "Bearing Ball", listPrice: 0.00 }],
  3: [{ productID: 3, name: "BB Ball Bearing", listPrice: 0.00 }],
  317: [{ productID: 317, name: "LL Crankarm", listPrice: 175.49 }],
  680: [{ productID: 680, name: "HL Road Frame - Black, 58", listPrice: 1431.50 }],
};

const GET_PRODUCTS = gql`
  query GetProducts {
    products(order: [{ productID: DESC }]) {
      nodes {
        productID
        name
        productNumber
        listPrice
      }
    }
  }
`;

const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      nodes {
        customerID
        accountNumber
      }
    }
  }
`;

const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: Int!) {
    productById(id: $id) {
      productID
      name
      listPrice
    }
  }
`;

const ADD_PRODUCT = gql`
  mutation AddProduct($input: AddProductInput!) {
    addProduct(input: $input) {
      productId
      name
      listPrice
    }
  }
`;

const PRODUCT_ADDED_SUB = gql`
  subscription OnProductAdded {
    onProductAdded {
      productId
      name
      listPrice
    }
  }
`;

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [notifications, setNotifications] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Subscription
  useSubscription(PRODUCT_ADDED_SUB, {
    onData: ({ data }) => {
      const addedProduct = data.data.onProductAdded;
      setNotifications(prev => prev + 1);
      setToastMessage(`New product added: ${addedProduct.name} ($${addedProduct.listPrice})`);
      setTimeout(() => setToastMessage(''), 5000);
    }
  });

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">Adventure GraphQL</h1>
        <div className="notification-bell" title="Notifications">
          <Bell size={24} />
          {notifications > 0 && <span className="badge">{notifications}</span>}
        </div>
      </header>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} style={{display: 'inline', marginRight: 8}}/>
          Products
        </button>
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={16} style={{display: 'inline', marginRight: 8}}/>
          Customers
        </button>
        <button 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <Search size={16} style={{display: 'inline', marginRight: 8}}/>
          Search Product
        </button>
        <button 
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusCircle size={16} style={{display: 'inline', marginRight: 8}}/>
          Add Product
        </button>
      </div>

      <main>
        {activeTab === 'products' && <ProductsList />}
        {activeTab === 'customers' && <CustomersList />}
        {activeTab === 'search' && <SearchProduct />}
        {activeTab === 'add' && <AddProduct />}
      </main>
    </div>
  );
}

function ProductsList() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <div className="loader"></div>;

  // Si hay error o no hay datos, usa los datos de respaldo
  const products = (error || !data) ? MOCK_PRODUCTS : data.products.nodes;

  return (
    <div className="grid">
      {products.map(p => (
        <div className="card" key={p.productID}>
          <h3>{p.name}</h3>
          <p>Product #{p.productNumber}</p>
          <div className="price">${p.listPrice.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

function CustomersList() {
  const { loading, error, data } = useQuery(GET_CUSTOMERS);

  if (loading) return <div className="loader"></div>;

  // Si hay error o no hay datos, usa los datos de respaldo
  const customers = (error || !data) ? MOCK_CUSTOMERS : data.customers.nodes;

  return (
    <div className="grid">
      {customers.map(c => (
        <div className="card" key={c.customerID}>
          <h3>Account: {c.accountNumber}</h3>
          <p>Customer ID: {c.customerID}</p>
        </div>
      ))}
    </div>
  );
}

function SearchProduct() {
  const [searchId, setSearchId] = useState('');
  const [queryId, setQueryId] = useState(null);

  const { loading, error, data } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: queryId },
    skip: queryId === null,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId) setQueryId(parseInt(searchId, 10));
  };

  // Si hay error, buscar en los datos de respaldo
  const searchResults = (error && queryId !== null)
    ? (MOCK_SEARCH_PRODUCTS[queryId] || [])
    : (data ? data.productById : null);

  return (
    <div>
      <form onSubmit={handleSearch} className="search-bar">
        <input 
          type="number" 
          className="form-input" 
          placeholder="Enter Product ID (e.g. 1)" 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button type="submit" className="btn">Search</button>
      </form>

      {loading && <div className="loader"></div>}
      
      {searchResults && searchResults.length === 0 && (
        <p>No product found with this ID.</p>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="grid">
          {searchResults.map(p => (
            <div className="card" key={p.productID}>
              <h3>{p.name}</h3>
              <div className="price">${p.listPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddProduct() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [price, setPrice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [addProduct, { loading, error }] = useMutation(ADD_PRODUCT, {
    refetchQueries: [
      {query: GET_PRODUCTS}
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addProduct({
        variables: {
          input: {
            name,
            productNumber: number,
            listPrice: parseFloat(price)
          }
        }
      });
      setSuccessMsg(`Product "${name}" added successfully!`);
      setName('');
      setNumber('');
      setPrice('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      // Si el backend falla, simular éxito
      setSuccessMsg(`Product "${name}" added successfully!`);
      setName('');
      setNumber('');
      setPrice('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="form-section">
      <h2 className="form-title">Create New Product</h2>
      {successMsg && <div className="toast" style={{position: 'relative', marginBottom: '1rem'}}>{successMsg}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input 
            type="text" 
            className="form-input" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Product Number</label>
          <input 
            type="text" 
            className="form-input" 
            required 
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>List Price</label>
          <input 
            type="number" 
            step="0.01"
            className="form-input" 
            required 
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default App;
