const { React } = require('powercord/webpack');
const { close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { TextInput } = require('powercord/components/settings');
const popout = require('./Window.js')
const { sleep } = require('powercord/util');

async function waitForElement(querySelector, win) {
  let elem;
  while (!(elem = win.document.querySelector(querySelector))) {
    await sleep(1);
  }
  return elem;
}

module.exports = React.memo(
    ({ bits, args }) => (
        <Confirm
            red={false}
            header='Permission Input'
            confirmText='Invite'
            cancelText='Cancel'
            onCancel={closeModal}
            onConfirm={async () => {
                const win = await popout(`${window.location.origin}/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot&permissions=${bits}`, 'title', 'DISCORD_BOT_POPOUT');
                (await waitForElement('div.footer-3ZalXG > button.button-38aScr.lookLink-9FtZy-', win)).addEventListener('click', () => {
                    win.close();
                });
                closeModal();
            }}
        >
            <TextInput
                type={'number'}
                required={true}
                onChange={val => bits = val}
            >
                Permission Integer
          </TextInput>
        </Confirm>
    )
);