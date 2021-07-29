const { ShardingManager } = require('discord.js');
const Config = require('./lib/handlers/Config');

const config = new Config();
const manager = new ShardingManager('./bot/start.js', {
  execArgv: ['--trace-warnings'],
  shardArgs: ['--ansi', '--color'],
  totalShards: 'auto',
  token: config.getToken(),
  respawn: true,
});

manager.on('shardCreate', (shard) =>
  console.log(`💠 Launched shard ${shard.id}`)
);
manager.spawn();
