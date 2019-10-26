/*
 * Copyright 2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ExtensionContext, commands } from 'vscode';
import { multiInject, injectable } from 'inversify';
import { ExtensionContextAware } from '@pivotal-tools/vscode-extension-core';
import { Command } from './command';
import { DITYPES } from '../ditypes';

@injectable()
export class CommandsManager implements ExtensionContextAware {

    constructor(
        @multiInject(DITYPES.Command) private commands: Command[]
    ) {}

    onExtensionContext(context: ExtensionContext) {
        this.registerCommands(context);
    }

    private registerCommands(context: ExtensionContext) {
        for (const c of this.commands) {
            const cmd = commands.registerCommand(c.id, c.execute, c);
            context.subscriptions.push(cmd);
        }
    }
}
