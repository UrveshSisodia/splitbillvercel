import { useState } from 'react';
import axios from 'axios'; // Import Axios
import './App.css';

function App() {

  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('');
  const [id, setId] = useState([])
  const [step, setStep] = useState(1)
  const [currentId, setCurrentId] = useState('');

  const [resultList, setResultList] = useState([]);

  const [msg, setMsg] = useState(null)

  const addField = () => {
    if (!currentId.trim()) {
      return;
    }
    setId([...id, { name: currentId, requested: false }]);
    setCurrentId('');
  };

  const removeField = (index) => {
    setId(id.filter((_, i) => i !== index));
  };
  const MAX_AMOUNT = 100000;
  const handleAmountInput = (e) => {

    if (!amount) {
      setMsg({ text: "Please enter an amount!", type: 'error' });

      setTimeout(() => setMsg(null), 2000);
      return;
    }
  

    if (amount <= 0) {
      setMsg({ text: "Amount cannot be Negative!", type: 'error' });
      setAmount('');
      setTimeout(() => setMsg(null), 2000);

      return;
    }

    if (amount > MAX_AMOUNT) {
      setMsg({ text: `Amount cannot exceed ₹${MAX_AMOUNT}!`, type: 'error' });
      setAmount('');
      setTimeout(() => setMsg(null), 2000);
      return;
    }
    setStep(step + 1);
  };

  const calculateSplit = async () => {
    if (!amount || !payer) {
      setMsg({ text: "Please enter an UPI ID!", type: 'error' })
      setTimeout(() => setMsg(null), 2000);
      return;
    }

    try {
      const res = await axios.post('/api/split', {
        amount: amount,
        payer: payer,
        Id: id
      });

      setResultList(res.data);
      setStep(step + 1);
    } catch (error) {
      console.log("Error connecting to backend");
      setMsg({ text: "Server Error!", type: 'error' }); 
      setTimeout(() => setMsg(null), 2000);
    }
  };

  const handleRequest = (index) => {
    const updatedList = [...resultList];
    updatedList[index].requested = true;
    setResultList(updatedList);

    setMsg({ text: `Request sent to ${updatedList[index].name}!`, type: 'success' });

    setTimeout(() => {
      setMsg(null);
    }, 3000);
  };

  const handleHome = () => {
    setAmount('');
    setId([]);
    setResultList([]);
    setPayer('');
    setStep(1);
    setMsg(null);
  };

  return (
    <>
      <div className='input_container'>
        <div className="card">
          {step != 4 &&
            <>
              <div className='cardTitle'>
                <div className='cardTitle_text'>
                  Pay together & say nothing</div>
              </div>
            </>
          }
          {msg && (
            <div style={{
              color: 'white',
              backgroundColor: msg.type === 'success' ? '#16a34a' : '#dc2626',
              position: 'absolute', padding: '10px', top: '5px', left: '50%',
              transform: 'translateX(-50%)', width: '90%', zIndex: 100,
              fontSize: '16px', borderRadius: '5px', textAlign: 'center'
            }}>{msg.text}</div>
          )}

          <form onSubmit={(e) => e.preventDefault()}> 
            {step <= 1 &&
              <>
                <input maxLength={2} onKeyDown={(e) => {
        if (["e", "E", "+", "-", "."].includes(e.key)) {
            e.preventDefault();
        }
    }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='₹ Total Bill' />
              </>
            }
            {step === 2 && (
              <>
                {msg && (
                  <div style={{
                    color: 'white',
                    backgroundColor: msg.type === 'success' ? 'rgba(9, 166, 69, 1)' : 'rgba(244, 6, 6, 1)',
                    position: 'absolute', padding: '10px', top: '5px', left: '50%',
                    transform: 'translateX(-50%)', width: '90%', zIndex: 100,
                    fontSize: '16px', borderRadius: '5px', textAlign: 'center'
                  }}>{msg.text}</div>
                )}
                <div className='cardSubtitle'>
                  <span className="label">TOTAL AMOUNT</span>
                  <span className="value">₹{amount}</span>
                </div>

                <div className="mainuserIdinput">
                  <div className="label-text">You (Payer)</div>
                  <input
                    type="text"
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    placeholder='Enter your UPI ID'
                  />
                </div>
                <div className="scroll_container">

                  {id.map((id, index) => (
                    <div key={index} className="list_item">
                      <span>{id.name}</span>
                      <button
                        type="button"
                        className="remove_btn"
                        onClick={() => removeField(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {parseInt(amount) > id.length + 1 ? (
                  <div className="input_row">
                    <input
                      type="text"
                      value={currentId}
                      onChange={(e) => setCurrentId(e.target.value)}
                      placeholder='Enter Friend Name'
                    />
                    <button type='button' className="add_btn" onClick={addField}> + </button>
                  </div>
                ) : (
                  <div style={{ color: 'grey', fontSize: '13px', marginTop: '10px' }}>
                    Limit Reached (₹1/Friend)
                  </div>
                )}
              </>
            )}
            {
              step === 3 &&
              <>
                {msg && (
                  <div style={{
                    color: 'white',
                    backgroundColor: msg.type === 'success' ? 'rgba(9, 166, 69, 1)' : 'rgba(244, 6, 6, 1)',
                    position: 'absolute', padding: '10px', top: '5px', left: '50%',
                    transform: 'translateX(-50%)', width: '90%', zIndex: 100,
                    fontSize: '16px', borderRadius: '5px', textAlign: 'center'
                  }}>{msg.text}</div>
                )}

                <div className='cardSubtitle1'>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }} >
                      <span className="label">TOTAL</span>
                      <span className="label1">TO COLLECT</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>₹{amount - (resultList[0]?.share || 0)}</div>
                    <span className="value">₹{amount}</span>
                  </div>
                  <hr className='line'></hr>
                  <div style={{ paddingTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    Your Net Cost :

                    <span>₹{resultList[0].share}</span>
                  </div>
                </div>

                <div className="scroll_container">

                  {resultList.map((item, index) => {

                    if (index === 0) return null;

                    return (
                      <div key={index} className="list_item">

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <span>{item.name}</span>
                          <span style={{ fontSize: '12px', color: '#666' }}></span>
                        </div>
                        {item.share > 0 &&
                          <button
                            type="button"
                            className='share_btn'
                            style={{
                              backgroundColor: item.requested ? '#c3c7cc' : '',
                              cursor: item.requested ? 'default' : 'pointer'
                            }}
                            onClick={() => {
                              if (!item.requested) {
                                handleRequest(index);
                              }
                            }}
                          >

                            {item.requested ? 'Requested' : `Request ₹${item.share}`}
                          </button>
                        }
                      </div>
                    )
                  })}
                </div>
              </>
            }
          </form >
          {step >= 4 &&
            <>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>✅</div>
                <h2 style={{ color: '#061238', marginBottom: '20px' }}>Paid Successfully!</h2>
              </div>
              < button type='button' onClick={handleHome}>Back To Home</button >
            </>
          }


          {step === 1 &&
            < button type='button' onClick={handleAmountInput}  >Next</button >
          }
          {step === 2 &&
            < button type='button' onClick={calculateSplit}>Next</button >
          }

          {
            step === 3 &&
            < button type='button' onClick={() => setStep(step + 1)}>Pay</button >
          }

        </div >
      </div>
    </>
  )
}
export default App;