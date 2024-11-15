chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.message === "generate_questions") {
        const questionsPrompt = `Based on the following content, generate 3 food, keep the questions short and concise: ${request.content.substring(0, 2000)}`;  
        const session = await ai.languageModel.create({
            systemPrompt: `You are a helpful assistant that helps people create 3 food based on a provided text.`,
        });
        const response = await session.prompt(`${questionsPrompt}`);
        
        const questions = response.split('\n')
            .filter(line => line.match(/^\d\./))
            .map(line => line.replace(/^\d\.\s*/, ''))
            .slice(0, 3);

        questions.forEach((question, index) => {
            questions[index] = question.replace(/\*\*/g, '');
        })
        
        chrome.tabs.sendMessage(sender.tab.id, {
            message: "questions_generated",
            questions: questions
        });
    }
    if(request.message === "lookup_ai") {
        const prompt = request.prompt;
        const session = await ai.languageModel.create({
            systemPrompt: `You are a helpful assistant that helps people with recipes. You are helpful, creative, and friendly.`,
        });

        const tabId = sender.tab.id;


        let promptResp = await session.prompt(`${prompt}`);

        promptResp = promptResp.replace(/```json/g, '');
        promptResp = promptResp.replace(/```/g, '');
        chrome.tabs.sendMessage(tabId, {message: "lookup_ai", promptResp: promptResp});
    }

})
