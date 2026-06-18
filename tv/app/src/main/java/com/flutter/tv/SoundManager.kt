package com.flutter.tv

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool

object SoundManager {
    private lateinit var pool: SoundPool
    private var diceRattle = 0
    private var cardFlip = 0
    private var slumpCrash = 0
    private var dividendChaChing = 0
    private var roundFanfare = 0
    private var victory = 0
    private var tick = 0

    fun init(context: Context) {
        val attrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        pool = SoundPool.Builder().setMaxStreams(4).setAudioAttributes(attrs).build()
        diceRattle = pool.load(context, R.raw.dice_rattle, 1)
        cardFlip = pool.load(context, R.raw.card_flip, 1)
        slumpCrash = pool.load(context, R.raw.slump_crash, 1)
        dividendChaChing = pool.load(context, R.raw.dividend_chaching, 1)
        roundFanfare = pool.load(context, R.raw.round_fanfare, 1)
        victory = pool.load(context, R.raw.victory, 1)
        tick = pool.load(context, R.raw.tick, 1)
    }

    fun playDice() = pool.play(diceRattle, 1f, 1f, 1, 0, 1f)
    fun playCard() = pool.play(cardFlip, 1f, 1f, 1, 0, 1f)
    fun playSlump() = pool.play(slumpCrash, 1f, 1f, 1, 0, 1f)
    fun playDividend() = pool.play(dividendChaChing, 1f, 1f, 1, 0, 1f)
    fun playRoundEnd() = pool.play(roundFanfare, 1f, 1f, 1, 0, 1f)
    fun playVictory() = pool.play(victory, 1f, 1f, 1, 0, 1f)
    fun playTick() = pool.play(tick, 0.5f, 0.5f, 1, 0, 1f)
}










