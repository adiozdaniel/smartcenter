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
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
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

    const checkIfWalletIsConnected = async () => {

        try {
            
            if(!ethereum) return alert("Wallet is not connected");

            if(!currentAccount) {
                const accounts = await ethereum.request({ method: 'eth_accounts' });

            if(accounts.length > 0) {
                setCurrentAccount(accounts[0]);
                console.log(accounts);
                //getAllTransactions();
            }};
        } catch (error) {
            console.log(error);
            // throw new Error("No ethereum object.");
            console.log("Wallet is not connected");
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

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch (error) {
            // throw new Error("No ethereum object.");
            console.log(error);
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        // getEthereumContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <TransactionContext.Provider value={{ 
            connectWallet, currentAccount, formData, handleChange, sendTransaction
            }}>
            {children}
        </TransactionContext.Provider>
    );
};