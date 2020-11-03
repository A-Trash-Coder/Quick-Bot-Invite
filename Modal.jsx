const { React } = require('powercord/webpack');
const { close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { TextInput } = require('powercord/components/settings');

module.exports = React.memo(
    ({ bits, args }) => (
        <Confirm
            red={false}
            header='Permission Input'
            confirmText='Invite'
            cancelText='Cancel'
            onCancel={closeModal}
            onConfirm={async () => {
                window.open(`https://discord.com/oauth2/authorize?client_id=${args[0]['user']['id']}&scope=bot&permissions=${bits}`);
                closeModal();
            }}
        >
            <TextInput
                required={true}
                onChange={val => bits = val}
            >
                Permission Integer
          </TextInput>
        </Confirm>
    )
);