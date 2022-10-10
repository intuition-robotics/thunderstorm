@Library('dev-tools')

import com.nu.art.pipeline.modules.SlackModule
import com.nu.art.pipeline.modules.git.Cli
import com.nu.art.pipeline.modules.build.BuildModule
import com.nu.art.pipeline.modules.build.TriggerCause
import com.nu.art.pipeline.thunderstorm.Pipeline_ThunderstormMain
import com.nu.art.pipeline.workflow.Workflow
import com.nu.art.pipeline.workflow.variables.Var_Creds
import com.nu.art.pipeline.workflow.variables.Var_Env

class Pipeline_Build
	extends Pipeline_ThunderstormMain<Pipeline_Build> {

	public Var_Env Env_SecretNPM = new Var_Env("NPM_SECRET")
	public Var_Creds Creds_SecretNPM = new Var_Creds("string", "npm_token", Env_SecretNPM)

	Pipeline_Build() {
		super("Thunderstorm", "thunderstorm", SlackModule.class)
	}

	@Override
	protected void init() {
		setRequiredCredentials(Creds_SecretNPM)

		declareEnv("dev", "ir-thunderstorm-dev")
		declareEnv("staging", "ir-thunderstorm-staging")
		declareEnv("prod", "ir-thunderstorm")
		setGitRepoId("intuition-robotics/thunderstorm", true)
		super.init()

//		getRepo().assertCommitDiffs()
	}

	@Override
	void _postInit() {
		TriggerCause[] causes = getModule(BuildModule.class).getTriggerCause(TriggerCause.Type_Unknown)
		this.logInfo("GOT HERE!! ${causes.size()}")
		TriggerCause cause = causes.find {it.print() == "Cause(org.jenkinsci.plugins.gwt.GenericCause): IR-Jenkins"}
		causes.each {
			this.logInfo("Detected SCM cause: '${it.type}'")
		}

		if (cause) {
			workflow.terminate("Detected push from Jenkins")
		}
                if (${VarConsts.Var_UserEmail.get()} == "IR-Jenkins") {
                        workflow.terminate("Detected push from Jenkins")
                }
                if (${VarConsts.Var_UserEmail.get()} == "AndreiHardziyenkaIR") {
                        workflow.terminate("Detected push from Jenkins")
                }
    

		super.postInit()
	}

	@Override
	void pipeline() {
//		super.pipeline()
		workflow.deleteWorkspace()
		checkout({
			getModule(SlackModule.class).setOnSuccess(getRepo().getChangeLog().toSlackMessage())
		})

		install()
		clean()
		build()
//		test()

//		deploy()

		addStage("Auth NPM", {
			Cli cli = new Cli("#!/bin/bash")
				.append("source \"\$HOME/.nvm/nvm.sh\"")
				.append("nvm use")
				.append("npm config list")
				.append("npm config delete fee72d7c-e603-453e-931d-7385ae0b261e")
				.append("npm config set //registry.npmjs.org/:_authToken ${Env_SecretNPM.get()}")
				.append("npm whoami")
				.append("npm config list")
			getRepo().sh(cli)
		})
		publish()
	}
}

node() {
	Workflow.createWorkflow(Pipeline_Build.class, this)
}
