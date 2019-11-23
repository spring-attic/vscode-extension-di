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
import { ExtensionContext } from 'vscode';
import { ContainerModule, decorate, injectable } from 'inversify';
import {
    ExtensionActivateAware, ExtensionContextAware, SettingsManager, DefaultSettingsManager, NotificationManager,
    OutputManager, StatusBarManager, StatusBarManagerItem, AbstractStatusBarManagerItem, LanguageServerManager,
    LanguageSupport, IconManager, ReadOnlyDocumentManager, JavaFinder, DefaultJavaFinder
} from '@pivotal-tools/vscode-extension-core';
import { DITYPES } from './ditypes';
import { ExtensionActivateManager } from './extension-activate-manager';
import { CommandsManager } from './command/commands-manager';

const coreContainerModule = new ContainerModule((bind) => {
    bind<ExtensionActivateAware>(DITYPES.ExtensionActivateAware).to(ExtensionActivateManager);
    bind<ExtensionContextAware>(DITYPES.ExtensionContextAware).to(CommandsManager);
    bind<OutputManager>(DITYPES.OutputManager).toDynamicValue(() => new OutputManager()).inSingletonScope();
    bind<NotificationManager>(DITYPES.NotificationManager).toDynamicValue(
        context => {
            let locationKey: string|undefined;
            if (context.container.isBound(DITYPES.NotificationManagerLocationKey)) {
                locationKey = context.container.get<string>(DITYPES.NotificationManagerLocationKey);
            }
            return new NotificationManager(locationKey);
        }
    ).inSingletonScope();
    bind<SettingsManager>(DITYPES.SettingsManager).toDynamicValue(
        context => {
            const extensionContext = context.container.get<ExtensionContext>(DITYPES.ExtensionContext);
            return new DefaultSettingsManager(extensionContext);
        }
    );
    // sucks that you need to decorate base class for status bar items
    decorate(injectable(), AbstractStatusBarManagerItem);
    bind<StatusBarManager>(DITYPES.StatusBarManager).toDynamicValue(
        context => {
            const items = context.container.getAll<StatusBarManagerItem>(DITYPES.StatusBarManagerItem);
            return new StatusBarManager(items);
        }
    ).inSingletonScope();
    bind<LanguageServerManager>(DITYPES.LanguageServerManager).toDynamicValue(
        context => {
            const extensionContext = context.container.get<ExtensionContext>(DITYPES.ExtensionContext);
            const languageSupports = context.container.getAll<LanguageSupport>(DITYPES.LanguageSupport);
            const notificationManager = context.container.get<NotificationManager>(DITYPES.NotificationManager);
            return new LanguageServerManager(extensionContext, languageSupports, notificationManager);
        }
    ).inSingletonScope();
    bind<ReadOnlyDocumentManager>(DITYPES.ReadOnlyDocumentManager).toDynamicValue(
        context => {
            const extensionContext = context.container.get<ExtensionContext>(DITYPES.ExtensionContext);
            return new ReadOnlyDocumentManager(extensionContext);
        }
    ).inSingletonScope();

    bind<IconManager>(DITYPES.IconManager).toDynamicValue(
        context => {
            const extensionContext = context.container.get<ExtensionContext>(DITYPES.ExtensionContext);
            return new IconManager(extensionContext);
        }
    ).inSingletonScope();

    bind<JavaFinder>(DITYPES.JavaFinder).toDynamicValue(
        context => {
            let javaHomeConfigKey: string|undefined;
            if (context.container.isBound(DITYPES.JavaFinderJavaHomeKey)) {
                javaHomeConfigKey = context.container.get<string>(DITYPES.JavaFinderJavaHomeKey);
            }
            if (!javaHomeConfigKey) {
                javaHomeConfigKey = 'java.home';
            }
            return new DefaultJavaFinder(javaHomeConfigKey);
        }
    );
});
export default coreContainerModule;
