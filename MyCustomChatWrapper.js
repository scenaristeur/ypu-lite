import { fileURLToPath } from "url";
import path from "path";
import {
    getLlama, LlamaChatSession, Llama3_2LightweightChatWrapper,
    LlamaText, SpecialTokensText, SpecialToken
} from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MyCustomChatWrapper extends Llama3_2LightweightChatWrapper {
    constructor() {
        super();
        this.wrapperName = "MyCustomChat";
        this.settings = {
            ...Llama3_2LightweightChatWrapper.defaultSettings
        };
    }

   generateContextState(options) {
    const { chatHistory, availableFunctions, documentFunctionParams } = options;
    const chatHistoryWithPreamble = this.prependPreambleToChatHistory(chatHistory);
    const historyWithFunctions = this.addAvailableFunctionsSystemMessageToHistory(chatHistoryWithPreamble, availableFunctions, {
        documentParams: documentFunctionParams
    });

    const resultItems = [];

    let systemTexts = [];
    let userTexts = [];
    let modelTexts = [];
    let currentAggregateFocus = null;

    const flush = () => {
        if (systemTexts.length > 0 || userTexts.length > 0 || modelTexts.length > 0) {
            resultItems.push({
                system: systemTexts.length === 0
                    ? null
                    : LlamaText.joinValues(
                        resultItems.length === 0 && this._specialTokensTextForPreamble
                            ? LlamaText(new SpecialTokensText("\n\n"))
                            : "\n\n",
                        systemTexts
                    ),
                user: userTexts.length === 0
                    ? null
                    : LlamaText.joinValues("\n\n", userTexts),
                model: modelTexts.length === 0
                    ? null
                    : LlamaText.joinValues("\n\n", modelTexts)
            });
        }

        systemTexts = [];
        userTexts = [];
        modelTexts = [];
    };

    for (const item of historyWithFunctions) {
        if (item.type === "system") {
            if (currentAggregateFocus !== "system") flush();
            currentAggregateFocus = "system";
            systemTexts.push(LlamaText.fromJSON(item.text));
        } else if (item.type === "user") {
            if (currentAggregateFocus !== "user") flush();
            currentAggregateFocus = "user";
            userTexts.push(LlamaText(item.text));
        } else if (item.type === "model") {
            if (currentAggregateFocus !== "model") flush();
            currentAggregateFocus = "model";
            modelTexts.push(this.generateModelResponseText(item.response));
        }
    }

    flush();

    const contextText = LlamaText(
        new SpecialToken("BOS"),
        resultItems.map((item, index) => {
            const isLastItem = index === resultItems.length - 1;
            const res = [];

            if (item.system != null) {
                res.push(
                    LlamaText([
                        new SpecialTokensText("<|start_header_id|>system<|end_header_id|>\n\n"),
                        item.system,
                        new SpecialToken("EOT")
                    ])
                );
            }

            if (item.user != null) {
                res.push(
                    LlamaText([
                        new SpecialTokensText("<|start_header_id|>user<|end_header_id|>\n\n"),
                        item.user,
                        new SpecialToken("EOT")
                    ])
                );
            }

            if (item.model != null) {
                res.push(
                    LlamaText([
                        new SpecialTokensText("<|start_header_id|>assistant<|end_header_id|>\n\n"),
                        item.model,
                        isLastItem
                            ? LlamaText([])
                            : new SpecialToken("EOT")
                    ])
                );
            }

            return LlamaText(res);
        })
    );

    return {
        contextText,
        stopGenerationTriggers: [
            LlamaText(new SpecialToken("EOS")),
            LlamaText(new SpecialToken("EOT")),
            LlamaText(new SpecialTokensText("<|eot_id|>")),
            LlamaText(new SpecialTokensText("<|end_of_text|>")),
            LlamaText("<|eot_id|>"),
            LlamaText("<|end_of_text|>")
        ]
    };
}

}