# Window Terminal, Postgres, GithubSSH and Node.js Setup
<b>[Table of Contents](https://ecotrust-canada.github.io/markdown-toc/)</b>
  * [Window Terminal Setup](#window-terminal-setup)
  * [Postgres Setup](#postgres-setup)
    + [User Restriction](#user-restriction)
  * [NodeJS Setup](#nodejs-setup)
    + [Install LTS via nvm](#install-lts-via-nvm)
  * [Github SSH Connection Setup](#github-ssh-connection-setup)

## Window Terminal Setup

After downloading the Window Terminal,open Window Terminal as an Administrator

1) Open Settings

![windowterminal_step1](/docs/window_terminal/window_terminal_1.PNG)

2) Under the Sidebar, Select "Startup" > Default Profile > Ubuntu-20.04

![windowterminal_step2](/docs/window_terminal/window_terminal_2.PNG)

3) Key in to `“\\wsl$\”` to find your Ubuntu-20.04 at your directory

![windowterminal_step3](/docs/window_terminal/window_terminal_3.PNG)

4) Copy the directory from the folder, it should be `\\wsl$\Ubuntu-20.04\home\<user name>`

![windowterminal_step4](/docs/window_terminal/window_terminal_4.PNG)

5) Copy the directory and paste it into the Starting directory as shown in the picture
6) Sidebar > Ubuntu > Starting Directory> \\wsl$\Ubuntu-20.04\home\huijie

![windowterminal_step5](/docs/window_terminal/window_terminal_5.PNG)

7) Save the settings and reboot your terminal. It should be pointing directly to the folder that you have set. 

## Postgres Setup
Version
1) Setup the environment as Ubuntu-20.04 by clicking on the drop down list

![postgres_Setup1](/docs/postgres/postgres_1.PNG)

2) Visit https://www.postgresql.org/download/linux/ubuntu/ and follow the setup guide

3) Enter the following command steps in your window terminal

```bash
sudo apt install postgresql-client-common
```

```bash
sudo apt-get install postgresql-12
```

```bash
sudo apt install postgresql postgresql-contrib
```

```bash
sudo service postgresql start
```

### Setup User and Database
```bash
CREATE USER eezee with PASSWORD 'xxxx'
```

```bash
CREATE DATABASE eezee_sourcing_postgres OWNER eezee;
```

```bash
GRANT ALL PRIVILEGES ON DATABASE eezee_sourcing_postgres TO eezee
```

### User Restriction
* Ensure that your postgres user is a "Superuser"

* To Alter the role of the user to Super User by querying this command
	`ALTER USER eezee WITH SUPERUSER;`

![Screenshot](/docs/postgres/super_user.PNG)

## NodeJS Setup
1) Download [nvm](https://github.com/nvm-sh/nvm) for the setup

The 2 commands to follow in the guide are:

Step 1

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash 
```

Step 2

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

2) Restart the terminal

3) Type “nvm” to verify your installation

![node_1](/docs/node/node_1.PNG)

### Install LTS via nvm
```bash
nvm install --lts
```

```bash
nvm alias default 14
```

![node_2](/docs/node/node_2.PNG)

## Github SSH Connection Setup

Update the package 

```bash
sudo apt-get update
```

1) [Generate the GithubSSH Key](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
2) [Connecting the GithubSSH Key](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

You can search for your ssh key by keying cat .ssh/id_ed25519.pub within Window Terminal
![github_1](/docs/github/github_1.PNG)