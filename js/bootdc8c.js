

(() => {
  const maximumRetryCount = 30;
  const retryIntervalMilliseconds = 2000;
  const reconnectModal = document.getElementById('reconnect-modal');
  
  const startReconnectionProcess = () => {
    reconnectModal.style.display = 'inline-block';
  
    let isCanceled = false;

    (async () => {
      for (let i = 0; i < maximumRetryCount; i++) {
        // reconnectModal.innerHTML = `<span>reconnect: ${i + 1} of ${maximumRetryCount}</span><div class="spinner-border spinner-border-sm" role="status"></div>`;
        reconnectModal.innerHTML = `<div style="" class="spinner-border spinner-border-sm" role="status"></div>`;

        await new Promise(resolve => setTimeout(resolve, retryIntervalMilliseconds));

        if (isCanceled) {
          return;
        }

        try {
          const result = await Blazor.reconnect();
          if (!result) {
            // The server was reached, but the connection was rejected; reload the page.
            location.reload();
            return;
          }

          // Successfully reconnected to the server.
          return;
        } catch {
          // Didn't reach the server; try again.
        }
      }

      // Retried too many times; reload the page.
      location.reload();
    })();

    return {
      cancel: () => {
        isCanceled = true;
        reconnectModal.style.display = 'none';
      },
    };
  };

  let currentReconnectionProcess = null;

  Blazor.start({
    reconnectionHandler: {
      onConnectionDown: () => currentReconnectionProcess ??= startReconnectionProcess(),
      onConnectionUp: () => {
        currentReconnectionProcess?.cancel();
        currentReconnectionProcess = null;
      },
    },
  });
})();