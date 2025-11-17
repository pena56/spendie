import { Mic, MicOff, RefreshCcw, Volume2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Card } from "./ui/card";

interface SpeechInputModalProps {
  description?: string;
  open: boolean;
  setOpen: (val: boolean) => void;
  onConfirm?: (transacript: string) => void;
  isProcessing?: boolean;
}

export function SpeechInputModal({
  open,
  setOpen,
  description,
  isProcessing,
  onConfirm,
}: SpeechInputModalProps) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] border-2 border-black rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Speech Input
          </DialogTitle>
          <DialogDescription className="text-center text-black font-medium text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        {listening && (
          <div className="flex items-center gap-2 text-sm text-accent-foreground bg-accent px-3 py-1 rounded-full animate-pulse w-fit ml-auto">
            <Volume2 className="w-4 h-4" />
            <span>Listening...</span>
          </div>
        )}

        {browserSupportsSpeechRecognition ? (
          <div className="flex flex-col items-center space-y-4">
            <Button
              size="lg"
              onClick={() => {
                if (listening) {
                  SpeechRecognition.stopListening();
                } else {
                  SpeechRecognition.startListening({ continuous: true });
                }
              }}
              className={`rounded-full w-20 h-20 flex border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 items-center justify-center transition-all p-0 ${
                listening
                  ? "bg-red-400 hover:bg-red-300"
                  : "bg-yellow-400 hover:bg-yellow-300"
              }`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? (
                <MicOff className="w-10 h-10 text-black" />
              ) : (
                <Mic className="w-10 h-10 text-black" />
              )}
            </Button>
          </div>
        ) : (
          <Card className="p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 rounded-sm">
            <p className="text-sm text-black">
              Voice input is not supported in your browser. Please use Chrome,
              Edge, or Safari.
            </p>
          </Card>
        )}

        <div className="min-h-24 p-4 bg-muted rounded-sm border border-input relative">
          {transcript ? (
            <p className="text-foreground text-sm whitespace-pre-wrap wrap-break-word">
              {transcript}
            </p>
          ) : (
            <p className="text-black text-sm italic">
              Click the Mic to start speaking
            </p>
          )}

          <Button
            onClick={resetTranscript}
            className="absolute bottom-2 right-2"
            size={"sm"}
          >
            <RefreshCcw />
          </Button>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              className="border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex-1"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            onClick={() => {
              if (transcript) {
                onConfirm?.(transcript);
                resetTranscript();
              }
            }}
            disabled={!transcript || listening}
            isLoading={isProcessing}
            className="bg-green-600 hover:bg-green-700 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-black flex-1"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
