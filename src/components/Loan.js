import React, { useState, useRef, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { useContractRead, useProvider, useContract, useBalance, useAccount } from "wagmi";
import {
    loanAbi,
    loanContractAddress,
    tokenAbi,
    tokenContractAddress,
} from "../utils/constants"; 

export default function Loan(){
    const [selected, setTax] = useState('6%');
    const [isActive, setIsActive] = useState(7);
    const [isFetchingAmont, setIsFetchingAmount] = useState(false);
    const [isValidLoanAmount, setIsValidLoanAmount] = useState(true);
    const [isProceeding, setIsProceeding] = useState(false);
    const [isShowLoanDetails, setIsShowLoanDetails] = useState(false);
    const [loanInformation, setLoanInformation] = useState();
    const [contractLiquidity, setContractLiquidity] = useState();
    const provider = useProvider();
    const userAccount = useAccount();
    const ethInputRef = useRef();
    const kngInputRef = useRef();
    const interval = 700;
    let typingTimer;

    const handleChange = (e) => {
        setTax(e.target.value);
    }

    const handleKeyDown = (e) => {
        if (e.keyCode == 189 || e.keyCode == 109 || e.keyCode == 107) {
            setIsFetchingAmount(false);
            e.preventDefault();
        }
    };
    
    const handleKeyUp = (e) => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => handleOnChange(e), interval);
    };

    const handleOnChange = async (e) => {
        if(e.target.name == "eth"){
            // eth input
            if(ethInputRef.current.value){
                setIsFetchingAmount(true);
                const convertedToWei = ethers.utils.parseUnits(
                    ethInputRef.current.value,
                    18
                );
                const res = await getLoanContract.collateralAmount(convertedToWei);
                kngInputRef.current.value = res.toNumber();
                setIsFetchingAmount(false);
            }else{
                kngInputRef.current.value = "";
            }
        }else{
            // kng input
            if(kngInputRef.current.value){
                setIsFetchingAmount(true);
                let res = await getLoanContract.countEtherFromCollateral(
                    kngInputRef.current.value
                );
                res = ethers.utils.formatEther(res);
                ethInputRef.current.value = res;
                setIsFetchingAmount(false);
            }else{
                ethInputRef.current.value = "";
            }
        }
    };

    const getLoanContract = useContract({
        address: loanContractAddress,
        abi: loanAbi,
        signerOrProvider: provider,
    });

    const getTokenContract = useContract({
        address: tokenContractAddress,
        abi: tokenAbi,
    });

    const userBalance = useBalance({
        address: userAccount.address,
    });

    const getUserOnGoingLoan = async () => {
        if(provider){
            if(userAccount){
                const loan = await getLoanContract.getUserOngoingLoans();

                return loan;
            }
        }
    };

    const getUserOnGoingLend = async () => {
        let arr = [];
        if(provider){
            if(userAccount){
                const lends = await getLoanContract.getUserNotRetrieveLend();

                lends.forEach((item) => {
                    if (item.lender != "0x0000000000000000000000000000000000000000") {
                        arr.push(item);
                    }
                });
            }

            return arr;
        }
    };

    const setLiquidity = async () => {
        if(provider){
            if(userAccount){
                const liquidity = await getLoanContract.totalLiquidity();

                setContractLiquidity(
                    Number(ethers.utils.formatEther(liquidity.toString())).toFixed(3)
                );
            }
        }
    };

    return (
        <div className="row justify-content-center my-5">
            <div className="col-md-5">
                <div className="card shadow p-3">
                    <div className="card-head pt-2">
                        <h3>Loan</h3>
                    </div>
                    <div className="card-body text-start">
                        <p className="text-muted">How much do you want to borrow?</p>
                        <div className="input-group mb-3">
                            <input 
                                name="eth"
                                ref={ethInputRef}
                                onKeyUp={ (e) => handleKeyUp(e) }
                                onKeyDown={ (e) => handleKeyDown(e) }
                                type="number"
                                className="form-control" 
                                autoComplete="off" 
                                placeholder="0.0" 
                            />
                            <span className="input-group-text" id="basic-addon2">ETH</span>
                        </div>
                        <div className="input-group mb-3">
                            <input 
                                name="kng"
                                ref={kngInputRef}
                                onKeyUp={ (e) => handleKeyUp(e) }
                                onKeyDown={ (e) => handleKeyDown(e) }
                                type="number"
                                className="form-control" 
                                autoComplete="off" 
                                placeholder="0.0" 
                            />
                            <span className="input-group-text" id="basic-addon2">KNG</span>
                        </div>

                        <div className="d-flex align-content-start flex-wrap">
                            <div className="form-check me-2">
                                <input 
                                    className="form-check-input"
                                    type="radio" 
                                    value="6%" 
                                    checked={selected === '6%'} 
                                    onChange={handleChange} 
                                /> 7 Days
                            </div>
                            <div className="form-check me-2">
                                <input 
                                    className="form-check-input"
                                    type="radio" 
                                    value="7%" 
                                    checked={selected === '7%'} 
                                    onChange={handleChange} 
                                /> 14 Days
                            </div>
                            <div className="form-check me-2">
                                <input 
                                    className="form-check-input"
                                    type="radio" 
                                    value="8%" 
                                    checked={selected === '8%'} 
                                    onChange={handleChange} 
                                /> 30 Days
                            </div>
                        </div>
                        <div className="text-end">
                            <p className="text-muted">Rate : { selected } </p>
                        </div>
                        <div className="text-center d-grid gap-2">
                            <input 
                                type="button"
                                value="Submit"
                                className="btn btn-outline-primary py-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}