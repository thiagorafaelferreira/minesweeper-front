import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

//const baseUrl = "http://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8080/api/v1"
const baseUrl = "https://ec2-54-94-15-216.sa-east-1.compute.amazonaws.com:8443/api/v1"
const urlNewGame = `${baseUrl}/new_game`
const urlFlagPosition = `${baseUrl}/flag_position`
const urlFieldPosition = `${baseUrl}/click_position`
const urlReset = `${baseUrl}/reset_game`

function App() {

  const [gameMatch, setGameMatch] = useState({});
  const [numberRows, setNumberRows] = useState(10);
  const [numberColumns, setNumberColumns] = useState(10);
  const [numberMinesOnField, setNumberMinesOnField] = useState(10);
  const [numberFlags, setNumberFlags] = useState(10);
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);

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
      console.log("erro ao requisitar api reset")
    })
  }

  const validateGameOver = (gameMatch) => {
    if(gameMatch && gameMatch.status === "GAME_OVER") {
      alert("Você perdeu, inicie uma nova partida");
      return true;
    }
  }

  const allClicked = (mineField) => {
    if(!mineField) return;
    
    for(let row in mineField) {
      for(let column in mineField[row]) {
        console.log(mineField[row][column].clicked)
        if(!mineField[row][column].clicked && !mineField[row][column].mine && !mineField[row][column].flaged)
          return;
      }
    }
    alert("Você venceu a partida!")
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
        allClicked(response.data.mineField)
      }).catch(() => {
        console.log("erro ao requisitar api clickFieldPosition")
      })  
  }

  const newGame = React.useCallback(() => {
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
      setGameMatch(response.data)
      allClicked(response.data.mineField)
    }).catch(() => {
      console.log("erro ao requisitar api newGame")
    })
  }, [numberRows, numberColumns, numberMinesOnField]);

  const onKeyDown = () => {
    return false
  }

  useEffect(() => {
    newGame();
  }, [setGameMatch, newGame]);

  return (
    <div className="App">
      <header className="App-header">
        <input type="button" value="New game" onClick={clickResetNewGame} />
        <div className="counters">
          <div className="count-area win-count">{winCount}</div>
          <div className="count-area lose-count">{loseCount}</div>
        </div>
        <div>
          <div className="config-title">Rows</div>
          <div className="config-title">Columns</div>
          <div className="config-title">Mines</div>
          <div className="config-title">Flags</div>
        </div>
        <div className="area_config">
          <input type="number" className="config" value={numberRows} min="5" onChange={ev => setNumberRows(ev.target.value)} onKeyDown={onKeyDown} />
          <input type="number" className="config" value={numberColumns} min="5" onChange={ev => setNumberColumns(ev.target.value)} onKeyDown={onKeyDown} />
          <input type="number" className="config" value={numberMinesOnField} min="4" onChange={ev => setNumberMinesOnField(ev.target.value)} onKeyDown={onKeyDown} />
          <input type="number" className="config" value={numberFlags} readOnly />
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
