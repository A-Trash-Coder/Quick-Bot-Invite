const { React, getModule } = require('powercord/webpack');

class Popout extends React.PureComponent {
  constructor (props) {
    super(props);
    this.scriptRef = React.createRef();
  }

  componentDidMount () {
    console.log(this.scriptRef.current.ownerDocument.defaultView);
    this.props.resolve(this.scriptRef.current.ownerDocument.defaultView);
    const win = this.scriptRef.current.ownerDocument.defaultView;
    delete win.opener;
    delete win.DiscordNative;
    delete win.require;
    this.scriptRef.current.ownerDocument.location.href = this.props.url;
    let ready1 = false;
    let ready2 = false;
    const interval = setInterval(() => {
      if (ready1 && ready2) {
        clearInterval(interval);
      }
      if (win.require) {
        delete win.require;
        ready1 = true;
      }
      if (win.powercord?.pluginManager) {
        win.powercord.pluginManager.load = void 0;
        win.powercord.pluginManager.mount = void 0;
        ready2 = true;
      }
    }, 10);
  }

  render () {
    return React.createElement('div', { ref: this.scriptRef });
  }
}


module.exports = function (url, name, id) {
  return new Promise((resolve) => {
    const popoutModule = getModule([ 'setAlwaysOnTop', 'open' ], false);
    const PopoutWindow = getModule(m => m.DecoratedComponent && m.DecoratedComponent.render, false);
    popoutModule.open(id, (key) =>
      React.createElement(PopoutWindow, {
        windowKey: key,
        title: name,
        withTitleBar: true
      }, React.createElement(Popout, { url,
        resolve }))
    );
  });
};