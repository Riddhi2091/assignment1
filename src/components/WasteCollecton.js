import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';

function WasteCollection() {
    const [postcode, setPostcode] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedAddress, setSelectedAddress] = useState('');
    const [collectionData, setCollectionData] = useState(null);

    // Fetch address data
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                if (postcode.trim() !== '') {
                    const response = await axios.post(
                        'https://iweb.itouchvision.com/portal/itouchvision/kmbd_demo/address',
                        {
                            P_GUID: 'FF93E12280E5471FE053A000A8C08BEB',
                            P_POSTCODE: postcode
                        }
                    );
                    if (response.data.ADDRESS.length > 0) {
                        setAddresses(response.data.ADDRESS);
                        setErrorMessage('');
                    } else {
                        setAddresses([]);
                        setErrorMessage('Address not available for the entered postcode.');
                    }
                } else {
                    setAddresses([]);
                    setErrorMessage('');
                }
            } catch (error) {
                setErrorMessage('Address not available for the entered postcode. Please try again');
            }
        };

        fetchAddresses();
    }, [postcode]);


    // Fetch collection data
    useEffect(() => {
        const fetchCollectionData = async () => {
            if (selectedAddress && selectedAddress.UPRN) {
                try {
                    const response = await axios.post(
                        'https://iweb.itouchvision.com/portal/itouchvision/kmbd_demo/collectionDay',
                        {
                            P_GUID: 'FF93E12280E5471FE053A000A8C08BEB',
                            P_UPRN: selectedAddress.UPRN,
                            P_CLIENT_ID: 130,
                            P_COUNCIL_ID: 260
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    setCollectionData(response.data);
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchCollectionData();
    }, [selectedAddress]);

    // Onchange for postcode
    const handlePostcodeChange = (event) => {
        setPostcode(event.target.value);

    };

    // Onchange for address
    const handleAddressChange = (event) => {
        const selectedUprn = event.target.value;
        const selected = addresses.find(address => address.UPRN === parseInt(selectedUprn));
        setSelectedAddress(selected);
    };

    // Clear postcode and addresses
    const clearAddress = () => {
        setPostcode('');
        setAddresses([]);
        setErrorMessage('');
        setSelectedAddress('');
    };

    return (
        <Container>
            <Row>
                <Col lg={8}>
                    <h1><b>Find out your waste <br /> collection day</b></h1>
                    <p className='mt-4'><b>Check when your waste will be collected</b></p>

                    {/* form for postcode and address */}
                    <div className='form p-4'>
                        <div>
                            <label><b>Enter a postcode :</b></label><br />
                            <input type="text" value={postcode} onChange={handlePostcodeChange} />
                        </div>

                        <div className='mt-3'>
                            <label className='label' htmlFor="addresses"><b>Select an address :</b></label><br />
                            {errorMessage ? (
                                <p style={{ color: 'red' }}>{errorMessage}</p>
                            ) : (
                                <select className='mb-2' id="addresses" onChange={handleAddressChange} value={selectedAddress ? selectedAddress.UPRN.toString() : ''}>
                                    <option value="">Select an address...</option>

                                    {addresses.map((address, index) => (
                                        <option key={index} value={address.UPRN}>{address.FULL_ADDRESS}</option>
                                    ))}
                                </select>
                            )}
                            <br />
                            <a href='/' onClick={clearAddress}>Clear address and start again</a>
                        </div>
                    </div>

                    {/* cards for collections */}
                    <div className='cards my-4'>
                        
                        <Row className='' style={{ display: collectionData ? 'flex' : 'none' }}>
                        {collectionData &&  collectionData.collectionDay ?  (<h6><b>Your next collections</b></h6>): ""}
                            {collectionData && collectionData.collectionDay ? (
                                collectionData.collectionDay.map((bin, index) => (
                                    <Col lg={6} key={index} className={`box p-2 ${index % 2 === 0 ? 'mr-3' : 'ml-3'}`}>
                                        <div className='text-light py-4 px-3' style={{ backgroundColor: bin.binColor }}>
                                            <p>{bin.binType}</p>
                                            <h4>{bin.collectionDay}</h4>
                                            <p className='mt-5'>followed by {bin.followingDay}</p>
                                            {bin.description && <p className='mt-5'>{bin.description}</p>}
                                        </div>
                                    </Col>
                                ))
                            ) : (
                                <div className=''><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                              </svg><b className='p-3 mt-3'>There are no upcoming collections schedules for the above address</b></div>
                            )}
                        </Row>

                    </div>


                </Col>
            </Row>
        </Container>
    );
}

export default WasteCollection;
