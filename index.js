const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = class QuickBotInvite extends Plugin {
  async startPlugin() {
    await this.doImport()
    const menu = await getModule(["MenuItem"]);
    const GuildChannelUserContextMenu = await getModule(m => m.default && m.default.displayName === 'GuildChannelUserContextMenu');
    const oldDefault = GuildChannelUserContextMenu.default;
    inject('quick-bot-invite', GuildChannelUserContextMenu, 'default', (args, res) => {
      if (args[0]['user']['bot'] && res.props) {
        res.props.children.props.children.push(
          React.createElement(menu.MenuItem, {
            id: "QuickBotInviteButton",
            label: "Invite Bot",
          }, React.createElement(menu.MenuItem, {
            id: "no-perms",
            label: "No Permissions",
            action: () => window.open(`https://discord.com/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot`)
          }), React.createElement(menu.MenuItem, {
            id: "current-guild-perms",
            label: "Current Guild Permissions",
            action: async () => window.open(`https://discord.com/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot&permissions=${await this.getPermissionsRaw(args[0]['guildId'], args[0]['user']['id'])}`)
          })
          ));
      };
      return res
    });
    Object.assign(GuildChannelUserContextMenu.default, oldDefault)

  }

  async getPermissionsRaw(guildId, userId) {
    let permissions = 0;

    const guild = this.getGuild(guildId);
    const member = this.getMember(guildId, userId);


    if (guild && member) {
      if (guild.ownerId === userId) {
        permissions = Permissions.ADMINISTRATOR;
      } else {
        permissions |= guild.roles[guild.id].permissions;

        for (const roleId of member.roles) {
          permissions |= guild.roles[roleId].permissions;
        }
      }

      if ((permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
        return Object.values(Permissions).reduce((a, b) => a | b, 0);
      }
    }

    return permissions;
  }

  async import(filter, functionName = filter) {
    if (typeof filter === 'string') {
      filter = [filter];
    }

    this[functionName] = (await getModule(filter))[functionName];
  }

  async doImport() {
    await this.import('getMember');
    await this.import('getGuild');
  }

  pluginWillUnload() {
    uninject('quick-bot-invite')
  }
}