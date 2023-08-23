export type JiraVersion_Create = {
    archive?: boolean
    released?: boolean
    name: string
    projectId: string
}

export type JiraVersion = JiraVersion_Create & {
    self: string
    archive: boolean
    released: boolean
    id: string
}

export type JiraVersion_Update = Omit<JiraVersion, "self">
