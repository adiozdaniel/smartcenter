import { createContext, useEffect, useState} from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = createContext();

const { ethereum} = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
};

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCounts, setTransactionCounts] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({ 
        addressTo: '',
        amount: '',
        keyword: '',
        message: ''
     });

    const handleChange = (e, name) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: e.target.value
        }));
    };

    const getAllTransactions = async() => {
        
        try {
            if(!ethereum) return alert("Wallet is not connected");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map(transaction => ({
                addressFrom: transaction.sender,
                addressTo: transaction.receiver,
                amount: parseInt(transaction.amount._hex) / (10 ** 18),
                keyword: transaction.keyword,
                message: transaction.message,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString()
            }));

            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnected = async () => {

        try {
            
            if(!ethereum) return alert("Please install or reload Metamask");

            if(!currentAccount) {
                const accounts = await ethereum.request({ method: 'eth_accounts' });
                setCurrentAccount(accounts[0]);

            if(accounts.length > 0) {
                setCurrentAccount(accounts[0]);
                // console.log(accounts);
                getAllTransactions();
            }};
        } catch (error) {
            console.log(error);
            // throw new Error("No ethereum object.");
            console.log("Wallet is not connected");
        }
    };

    const checkIfTransactionsExist = async() => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactions();

            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {

            if (!ethereum) {
                alert("Get MetaMask!");
            }
            
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            console.log(accounts);          
            
        } catch (error) {
            console.log(error);
            // throw new Error("No ethereum object.");
        }
    };

    const sendTransaction = async () => {
        try {
            if (!ethereum) {
                alert("Get MetaMask!");
            }

            // get the data from the form...
            const { addressTo, amount, keyword, message} = formData;
            const transactionContract = getEthereumContract();
            const passedAmount =  (ethers.utils.parseEther(amount))._hex

            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    value: passedAmount,
                    gas: '0x5208', // 21000 GWEI
                    // gasPrice: ethers.utils.parseEther('10'),
                    // data: transactionContract.methods.sendTransaction(keyword, message).encodeABI() 
                }]
            });

            const transactionHash = await transactionContract.addToBlockChain(addressTo, passedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash} `);
            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash} `);

            const transactionCount = await transactionContract.getTransactions();
            setTransactionCounts(transactionCount.toNumber());

        } catch (error) {
            // throw new Error("No ethereum object.");
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
        // getEthereumContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TransactionContext.Provider value={{ 
            connectWallet, currentAccount, formData, handleChange, sendTransaction, isLoading, transactions, transactionCounts
            }}>
            {children}
        </TransactionContext.Provider>
    );
};