import { Transactions,Services, Footer, Navbar, Welcome } from './components/index';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <main className='min-h-screen' >
                <div className='gradient-bg-welcome' >
                    <Navbar/>
                    <Welcome/>
                </div>
                <Services />
                <Transactions/>
                <Footer/>   
            </main>
      </header>
    </div>
  );
}

export default App;