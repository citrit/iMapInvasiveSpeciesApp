self.addEventListener('message',
                      function(e) {
                        var data = e.data;
                        switch (data.cmd) {
                        case 'start':
                            window.plugins.spinnerDialog.show(data.title, data.msg);
                            break;
                        case 'stop':
                            window.plugins.spinnerDialog.hide();
                            //self.close(); // Terminates the worker.
                            break;
                        default:
                            self.postMessage('Unknown command: ' + data.msg);
                        };
                      }, false);