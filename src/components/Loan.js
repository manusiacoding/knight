import React, { useState, useRef, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import 'react-toastify/dist/ReactToastify.css';
import { useContractRead, useProvider, useContract, useBalance, useAccount } from "wagmi";
import {
    loanAbi,
    loanContractAddress,
    tokenAbi,
    tokenContractAddress,
} from "../utils/constants"; 

export default function Loan(){
    const [selected, setTax] = useState('7');
    const [isFetchingAmont, setIsFetchingAmount] = useState(false);
    const [isProceeding, setIsProceeding] = useState(false);
    const [loanInformation, setLoanInformation] = useState();
    const [contractLiquidity, setContractLiquidity] = useState();
    const [showModal, setShowModal] = useState(false);
    const provider = useProvider();
    const userAccount = useAccount();
    const ethInputRef = useRef();
    const kngInputRef = useRef();
    const interval = 700;
    let typingTimer;

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const notifyNotEnoughLiquidity = () => toast.error("Sorry, contract does not has enough liquidity!");
    const notifyNotValidAmount = () => toast.error("Sorry, minimum loan amount is 0.0001 ETH");

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
                    if (item.lender !== "0x0000000000000000000000000000000000000000") {
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

    const handleLoanProceed = async () => {
        if(ethInputRef.current.value < 0.00001 || kngInputRef.current.value < 1){
            notifyNotValidAmount();
        }else{
            setIsProceeding(true);
            const loanAmountToWei = ethers.utils.parseUnits(
                ethInputRef.current.value,
                18
            );

            // const res = await getLoanContract.checkEnoughLiquidity(loanAmountToWei);
            // if(res){
            //     // enough liquidity
            //     let date = new Date();
            //     date.setDate(date.getDate() + selected);
            //     setLoanInformation({
            //         lender: userAccount.address,
            //         loanAmount: ethInputRef.current.value,
            //         collateralAmount: kngInputRef.current.value,
            //         duration: selected,
            //         dateNow: date,
            //         rate: selected == 7 ? 6 : selected == 14 ? 7 : selected == 30 ? 8 : 0
            //     });
            // }else{
            //     notifyNotEnoughLiquidity();
            // }

            let date = new Date();
            date.setDate(date.getDate() + selected);
            setLoanInformation({
                lender: userAccount.address,
                loanAmount: ethInputRef.current.value,
                collateralAmount: kngInputRef.current.value,
                duration: selected,
                dateNow: date,
                rate: selected == 7 ? 6 : selected == 14 ? 7 : selected == 30 ? 8 : 0
            });

            setIsProceeding(false);
            handleShowModal();
        }
    };

    return ( 
        <div>
            {/* loan details modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Loan Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loanInformation && (
                        <div>
                            <div class="mb-3">
                                <label className="form-label">Lender</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={loanInformation.lender}
                                    readOnly
                                />
                            </div>
                            <div class="mb-3">
                                <label className="form-label">Loan Amount</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={loanInformation.loanAmount}
                                        readOnly
                                    />
                                    <span className="input-group-text" id="basic-addon2">ETH</span>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label className="form-label">Collateral Amount</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={loanInformation.collateralAmount}
                                        readOnly
                                    />
                                    <span className="input-group-text" id="basic-addon2">KNG</span>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label className="form-label">Duration</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={loanInformation.duration}
                                        readOnly
                                    />
                                    <span className="input-group-text" id="basic-addon2">Days</span>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label className="form-label">Date</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={loanInformation.dateNow}
                                    readOnly
                                />
                            </div>
                            <div class="mb-3">
                                <label className="form-label">Tax Rate</label>
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={loanInformation.rate}
                                        readOnly
                                    />
                                    <span className="input-group-text" id="basic-addon2">%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="row justify-content-center my-5">
                <div className="col-lg-4 col-md-6 col-sm-1">
                    <ToastContainer theme="dark" />
                    <div className="card p-3 mx-2">
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
                            {isFetchingAmont && (
                                <div className="mt-2 mb-3">
                                <p className="text-danger">Fetching best price...</p>
                                </div>
                            )}
                            <div className="d-flex align-content-start flex-wrap">
                                <div className="form-check me-2">
                                    <input 
                                        className="form-check-input"
                                        type="radio" 
                                        value="7" 
                                        checked={selected === '7'} 
                                        onChange={handleChange} 
                                    /> 7 Days
                                </div>
                                <div className="form-check me-2">
                                    <input 
                                        className="form-check-input"
                                        type="radio" 
                                        value="14" 
                                        checked={selected === '14'} 
                                        onChange={handleChange} 
                                    /> 14 Days
                                </div>
                                <div className="form-check me-2">
                                    <input 
                                        className="form-check-input"
                                        type="radio" 
                                        value="30" 
                                        checked={selected === '30'} 
                                        onChange={handleChange} 
                                    /> 30 Days
                                </div>
                            </div>
                            <div className="text-end">
                                <p className="text-muted">Rate : { selected == 7 ? 6 : selected == 14 ? 7 : selected == 30 ? 8 : 0 }% </p>
                            </div>
                            <div className="text-center d-grid gap-2">
                                <input 
                                    type="button"
                                    value="Submit"
                                    className="btn btn-outline-primary py-2"
                                    onClick={() => handleLoanProceed()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}