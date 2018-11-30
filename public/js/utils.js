async function enableEthereum() {
  if (window.ethereum) {
    metamask = new Web3(window.ethereum);
    try {
      await window.ethereum.enable();
      console.log('ethereum enabled...');
    } catch(error) {
      console.error(error);
    }
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
    console.log('Legacy web3 detected!');
  }
  else {
    console.log('Non-Ethereum browser detected!');
    return;
  }
}


function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function submitTransaction() {
  var wastCode = document.getElementById('wastCode').value;
  var value = document.getElementById('value').value;

  var wast = "";
  var wasm = "";

  // Validate wast
  if (wastCode.length > 0) {

    // Compile wast to wasm
    try {
      var module = window.Binaryen.parseText(wastCode);
      wasm = buf2hex(module.emitBinary());
    } catch (e) {
      alert(e);
    }

    // format hex to "wasm data"
    for (var i = 0; i < wasm.length; i +=2) {
      wast += "\\" + wasm.slice(i, i + 2);
    }

    // wrap wasm data into a deployer wast contract
    wast = `(module (import "ethereum" "finish" (func $finish (param i32 i32))) (memory (i32.div wasm.length / 65536)) (data (i32.const 0)  "${wast}") (export "memory" (memory 0)) (export "main" (func $main)) (func $main (call $finish (i32.const 0) (i32.const ${wasm.length / 2}))))`;

    // compile deployer wast contract to wasm
    try {
      var module = window.Binaryen.parseText(wast);
      wasm = buf2hex(module.emitBinary());
    } catch (e) {
      alert(e);
    }
  } else {
    alert('empty wast');
    return;
  }

  // Create transaction
  let txn = {}
  if (wasm.length > 0)
    txn.data = wasm;

  if (value) {
    value = parseInt(value);
    if (!value) {
      alert("must input number as value");
      return;
    } else {
      txn.value = value;
    }
  }

  metamask.eth.sendTransaction(txn, function(e, tx) {
    if (!e) {
      // success!
      window.location.href = '/tx/pending';
    } else {
      console.log(alert);
      alert(e);
    }
  });
}
