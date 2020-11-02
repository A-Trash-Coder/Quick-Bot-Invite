const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = class QuickBotInvite extends Plugin {
  async startPlugin() {
    const menu = await getModule(["MenuItem"]);
    const GuildChannelUserContextMenu = await getModule(m => m.default && m.default.displayName === 'GuildChannelUserContextMenu');
    const oldDefault = GuildChannelUserContextMenu.default;
    inject('quick-bot-invite', GuildChannelUserContextMenu, 'default', (args, res) => {
      if (args[0]['user']['bot'] && res.props) {
        res.props.children.props.children.push(
          React.createElement(menu.MenuItem, {
            name: "Invite Bot",
            separate: true,
            id: "QuickBotInviteButton",
            label: "Invite Bot",
            action: () => window.open(`https://discord.com/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot`),
          })
        );
      }
      return res
    });
  Object.assign(GuildChannelUserContextMenu.default, oldDefault)
  }

  pluginWillUnload() {
    uninject('quick-bot-invite')
  }
}
