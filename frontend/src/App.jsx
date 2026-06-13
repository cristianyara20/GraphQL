import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { Bell, Package, Users, Search, PlusCircle } from 'lucide-react';

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
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  return (
    <div className="grid">
      {data.products.nodes.map(p => (
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
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  return (
    <div className="grid">
      {data.customers.nodes.map(c => (
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
      {error && <div className="error-msg">Error: {error.message}</div>}
      
      {data && data.productById.length === 0 && (
        <p>No product found with this ID.</p>
      )}

      {data && data.productById.length > 0 && (
        <div className="grid">
          {data.productById.map(p => (
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
      setName('');
      setNumber('');
      setPrice('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="form-section">
      <h2 className="form-title">Create New Product</h2>
      {error && <div className="error-msg">Error: {error.message}</div>}
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
