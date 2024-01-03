# Time til next block
A progress bar counting milestones on the way to the next bitcoin block

# What is this?

A bitcoin block time visualizer

# How can I try it?

Click here: https://supertestnet.github.io/time-til-next-block/

# What is going on?

In the world of bitcoin, users create lots of transactions every second, and bitcoin miners collect them together into batches called Blocks, which they then add to the blockchain. Getting your transaction into a block on the blockchain is called getting it settled. Transactions can be canceled until they are settled so wallets (especially merchant wallets) typically don't consider them "legit" until they see them settle. New blocks/confirmations happen *on average* every 10 minutes, but that number is not reliable, it's only an average. Typical times are a semi-random number of minutes between 1 and 60 and they average toward 10 *over time.*

Bitcoiners who use their wallet daily (like myself) frequently find themselves "stuck" waiting for a transaction to settle, refreshing their wallet constantly, even when their wallet says to please not do that. Wallet developers struggle to find ways to inform users of what's happening in a way that feels like miners are making progress. Ordinary progress bars don't suffice here because they need a solid target, and the target here is an unknown number likely-but-not-necessarily between 1 and 60.

However, statistical analysis of the blockchain, as well as a bit of number theory, has allowed bitcoin researchers to glean some *hard numbers* about how long it usually takes miners to find blocks. I call the following set of hard numbers "milestones," and this progress bar counts progress toward them:

# The milestones

- 09.52% of blocks are mined within 1 minute
- 18.13% of blocks are mined within 2 minutes
- 25.92% of blocks are mined within 3 minutes
- 32.97% of blocks are mined within 4 minutes
- 39.35% of blocks are mined within 5 minutes
- 45.12% of blocks are mined within 6 minutes
- 50.34% of blocks are mined within 7 minutes
- 55.07% of blocks are mined within 8 minutes
- 59.34% of blocks are mined within 9 minutes
- 63.21% of blocks are mined within 10 minutes
- 77.69% of blocks are mined within 15 minutes
- 95.02% of blocks are mined within 30 minutes
- 98.89% of blocks are mined within 45 minutes
- 99.75% of blocks are mined within 60 minutes
- And so on

Since we have these hard numbers which nearly approach 100%, I made a progress bar out of them. The milestones also have nice round minute-numbers associated with them so I use those to show a relatively smooth incrementation that at least makes it *feel like* miners are making measurable progress toward finding the next block.

# The formula

The milestones are based on the following formula: 1 - e^(-1)

The number -1 is what you modify to calculate the milestones. -1 means a period of 10 minutes. -2 means a period of 20 minutes, and so on. It also works for decimals: -0.4 means a period of 4 minutes, -0.5 means a period of 5 minutes, and so on. 
