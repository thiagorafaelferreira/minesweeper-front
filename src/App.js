import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

const urlNewGame = "http://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8080/new_game"
const urlFlagPosition = "http://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8080/flag_position"
const urlFieldPosition = "http://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8080/click_position"
const urlReset = "http://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8080/reset_game"

function App() {

  const [gameMatch, setGameMatch] = useState({});
  const [numberRows, setNumberRows] = useState(10);
  const [numberColumns, setNumberColumns] = useState(10);
  const [numberMinesOnField, setNumberMinesOnField] = useState(10);
  const [numberFlags, setNumberFlags] = useState(10);

  const clickResetNewGame = () => {
    reset();
  }

  const reset = () => {
    let headers = {
      headers: {
          'user_id': '123456',
          'Content-Type': 'application/json'
      }
    }

    axios.delete(urlReset, headers).then(response => {
      console.log(response);
      if(response.data === "DELETED") {
        newGame();
      }
    }).catch(() => {
      console.log("erro ao requisitar api")
    })
  }

  const validateGameOver = (gameMatch) => {
    if(gameMatch && gameMatch.status === "GAME_OVER") {
      alert("Você perdeu, inicie uma nova partida");
      return true;
    }
  }

  const clickFieldPosition = (evt, row, column) => {
    evt.preventDefault();
    if(validateGameOver(gameMatch)) return;

    let headers = {
      headers: {
          'user_id': '123456',
          'Content-Type': 'application/json'
      }
    }

    if(evt.button === 2 && numberFlags > 0 ) {
        setNumberFlags(numberFlags - 1);
    }

    if(!(evt.button === 2 && numberFlags === 0))
      axios.put((evt.button === 2 && numberFlags > 0 ? urlFlagPosition : urlFieldPosition ) + `/${row}/${column}`, {}, headers).then(response => {
        setGameMatch(response.data)
        validateGameOver(response.data);
      }).catch(() => {
        console.log("erro ao requisitar api")
      })  
  }

  const newGame = () => {
    const requestBody = {
      numberRows: numberRows,
      numberColumns: numberColumns,
      numberMinesOnField: numberMinesOnField
    }

    setNumberFlags(numberMinesOnField);

    let headers = {
      headers: {
          'user_id': '123456',
          'Content-Type': 'application/json'
      }
    }

    axios.post(urlNewGame, requestBody, headers).then(response => {
      console.log(response);
      setGameMatch(response.data)
    }).catch(() => {
      console.log("erro ao requisitar api")
    })
  }

  useEffect(() => {
    newGame();
  }, [setGameMatch]);

  return (
    <div className="App">
      <header className="App-header">
        <input type="button" value="New game" onClick={clickResetNewGame} />
        <div>
          <div className="config-title">Rows</div>
          <div className="config-title">Columns</div>
          <div className="config-title">Mines</div>
          <div className="config-title">Flags</div>
        </div>
        <div className="area_config">
          <input type="number" className="config" value={numberRows} onChange={ev => setNumberRows(ev.target.value)} onKeyDown="return false" />
          <input type="number" className="config" value={numberColumns} onChange={ev => setNumberColumns(ev.target.value)} onKeyDown="return false" />
          <input type="number" className="config" value={numberMinesOnField} onChange={ev => setNumberMinesOnField(ev.target.value)} onKeyDown="return false" />
          <input type="number" className="config" value={numberFlags} readonly />
        </div>
        <div onContextMenu={(e)=>  {e.preventDefault(); return false;}}>
          {gameMatch && gameMatch.mineField &&
              gameMatch.mineField.map(field => <div className="row">
                {field.map(f => <div id={f.id} 
                  onMouseDown={evt => clickFieldPosition(evt, f.rowPosition, f.columnPosition)}
                  className={`${
                    gameMatch.status === "GAME_OVER" && f.mine
                      ? "field field-red" 
                      : (f.flaged 
                          ? "field field-yellow"
                          : (f.clicked 
                              ? "field field-blue"
                              : "field"))
                  }`}>{f.minesArround > 0 ? f.minesArround : ""}</div>)}
            </div>)}
        </div>
      </header>
    </div>
  );
}

export default App;
