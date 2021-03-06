const { Plugin } = require('powercord/entities');
const { getModule, React, constants: { Permissions } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');
const Modal = require('./Modal.jsx')
const popout = require('./Window.js')
const { sleep } = require('powercord/util');

async function waitForElement(querySelector, win) {
  let elem;
  while (!(elem = win.document.querySelector(querySelector))) {
    await sleep(1);
  }
  return elem;
}

module.exports = class QuickBotInvite extends Plugin {
  async startPlugin() {
    await this.doImport();
    const menu = await getModule(["MenuItem"]);
    const GuildChannelUserContextMenu = await getModule(m => m.default && m.default.displayName === 'GuildChannelUserContextMenu');
    const oldDefault = GuildChannelUserContextMenu.default;
    inject('quick-bot-invite', GuildChannelUserContextMenu, 'default', (args, res) => {
      let guilds = [];
      const clonableGuilds = Object.values(this.getFlattenedGuilds()).filter(guild => this.hasPermission(guild.id, Permissions.MANAGE_GUILD));
      for (const guild of clonableGuilds) {
        guilds.push(React.createElement(menu.MenuItem, {
          id: `to-guild-${guild.name}`,
          label: guild.name,
          action: async () => {
            const win = await popout(`${window.location.origin}/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot&disable_guild_select=true&guild_id=${guild.id}`, 'title', 'DISCORD_BOT_POPOUT');
            (await waitForElement('div.footer-3ZalXG > button.button-38aScr.lookLink-9FtZy-', win)).addEventListener('click', () => {
              win.close();
            });
          }
        }));
      };

      if (args[0]['user']['bot'] && res.props) {
        res.props.children.props.children.push(
          React.createElement(menu.MenuItem, {
            id: "QuickBotInviteButton",
            label: "Invite Bot",
          }, React.createElement(menu.MenuItem, {
            id: "no-perms",
            label: "No Permissions",
            action: async () => {
              const win = await popout(`${window.location.origin}/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot`, 'title', 'DISCORD_BOT_POPOUT');
              (await waitForElement('div.footer-3ZalXG > button.button-38aScr.lookLink-9FtZy-', win)).addEventListener('click', () => {
                win.close();
              });
            }
          }), React.createElement(menu.MenuItem, {
            id: "current-guild-perms",
            label: "Current Guild Permissions",
            action: async () => {
              const win = await popout(`${window.location.origin}/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot&permissions=${await this.getPermissionsRaw(args[0]['guildId'], args[0]['user']['id'])}`, 'title', 'DISCORD_BOT_POPOUT');
              (await waitForElement('div.footer-3ZalXG > button.button-38aScr.lookLink-9FtZy-', win)).addEventListener('click', () => {
                win.close();
              });
            }
          }), React.createElement(menu.MenuItem, {
            id: "custom-perms",
            label: "Custom Permissions",
            action: async () => this.doModal(args)
          }), React.createElement(menu.MenuItem, {
            id: "to-guild",
            label: "Add To Guild",
          }, guilds)
          ));
      };
      return res;
    });
    Object.assign(GuildChannelUserContextMenu.default, oldDefault);

  }

  doModal(args) {
    openModal(() =>
      React.createElement(Modal, {
        bits: 0, args: args
      })
    );
  };

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
        };
      };

      if ((permissions & Permissions.ADMINISTRATOR) === Permissions.ADMINISTRATOR) {
        return Object.values(Permissions).reduce((a, b) => a | b, 0);
      };
    };

    return permissions;
  };

  hasPermission(guildId, permission) {
    const permissions = this.getGuildPermissions(guildId);
    return permissions && (permissions & permission) !== 0;
  };

  async import(filter, functionName = filter) {
    if (typeof filter === 'string') {
      filter = [filter];
    };

    this[functionName] = (await getModule(filter))[functionName];
  };

  async doImport() {
    await this.import('getMember');
    await this.import('getGuild');
    await this.import('getFlattenedGuilds');
    await this.import('getGuildPermissions');
  };

  pluginWillUnload() {
    uninject('quick-bot-invite');
  };
}