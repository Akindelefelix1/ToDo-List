package com.akindelefelix.todolist

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

class VoiceRecognitionModule(
    private val context: ReactApplicationContext
) : ReactContextBaseJavaModule(context), RecognitionListener {

  private var recognizer: SpeechRecognizer? = null

  override fun getName() = "VoiceRecognition"

  @ReactMethod
  fun isAvailable(promise: Promise) {
    context.runOnUiQueueThread {
      promise.resolve(SpeechRecognizer.isRecognitionAvailable(context))
    }
  }

  @ReactMethod
  fun start(locale: String, promise: Promise) {
    context.runOnUiQueueThread {
      try {
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
          promise.reject("E_UNAVAILABLE", "Speech recognition is unavailable.")
          return@runOnUiQueueThread
        }

        destroyRecognizer()
        recognizer = SpeechRecognizer.createSpeechRecognizer(context).also {
          it.setRecognitionListener(this)
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
          putExtra(
              RecognizerIntent.EXTRA_LANGUAGE_MODEL,
              RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
          )
          putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
          putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale)
          putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
          putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
          putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your tasks")
        }

        recognizer?.startListening(intent)
        promise.resolve(null)
      } catch (error: Exception) {
        destroyRecognizer()
        promise.reject("E_START_FAILED", error.message, error)
      }
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    context.runOnUiQueueThread {
      recognizer?.stopListening()
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun cancel(promise: Promise) {
    context.runOnUiQueueThread {
      recognizer?.cancel()
      destroyRecognizer()
      promise.resolve(null)
    }
  }

  // Required by NativeEventEmitter. Android tracks listeners on the JS side.
  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Double) = Unit

  override fun onReadyForSpeech(params: Bundle?) {
    emit("voiceStart")
  }

  override fun onBeginningOfSpeech() = Unit

  override fun onRmsChanged(rmsdB: Float) = Unit

  override fun onBufferReceived(buffer: ByteArray?) = Unit

  override fun onEndOfSpeech() {
    emit("voiceEnd")
  }

  override fun onError(error: Int) {
    val message = when (error) {
      SpeechRecognizer.ERROR_AUDIO -> "The microphone could not capture audio."
      SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission was denied."
      SpeechRecognizer.ERROR_NETWORK,
      SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Speech recognition needs a network connection."
      SpeechRecognizer.ERROR_NO_MATCH -> "I couldn't understand that. Please try again."
      SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Voice recognition is busy. Please try again."
      SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech was heard. Please try again."
      else -> "Speech could not be recognized. Please try again."
    }

    emit("voiceError", Arguments.createMap().apply {
      putInt("code", error)
      putString("message", message)
    })
    destroyRecognizer()
  }

  override fun onResults(results: Bundle?) {
    val transcript =
        results
            ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            ?.firstOrNull()
            .orEmpty()

    emit("voiceResult", Arguments.createMap().apply {
      putString("transcript", transcript)
      putBoolean("partial", false)
    })
    destroyRecognizer()
  }

  override fun onPartialResults(partialResults: Bundle?) {
    val transcript =
        partialResults
            ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            ?.firstOrNull()
            .orEmpty()

    if (transcript.isNotBlank()) {
      emit("voicePartial", Arguments.createMap().apply {
        putString("transcript", transcript)
        putBoolean("partial", true)
      })
    }
  }

  override fun onEvent(eventType: Int, params: Bundle?) = Unit

  override fun invalidate() {
    context.runOnUiQueueThread { destroyRecognizer() }
    super.invalidate()
  }

  private fun emit(event: String, payload: WritableMap? = null) {
    if (context.hasActiveReactInstance()) {
      context
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit(event, payload)
    }
  }

  private fun destroyRecognizer() {
    recognizer?.destroy()
    recognizer = null
  }
}
